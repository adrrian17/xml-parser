import fs from 'fs';
import parser from 'xml2json';
import templateFile from 'template-file';

async function ls(path) {
  const files = await fs.promises.readdir(path);
  const { renderToFolder } = templateFile;

  for (const file of files) {
    if (file !== '.DS_Store' && file !== '.gitkeep') {
      fs.readFile(`${path}/${file}`, async function (err, data) {
        const XML = JSON.parse(parser.toJson(data));

        const folder =
          XML['cfdi:Comprobante']['Serie'] + XML['cfdi:Comprobante']['Folio'];

        const concepto =
          XML['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];

        const values = {
          RFC: XML['cfdi:Comprobante']['cfdi:Receptor']['Rfc'],
          idCatFormaPago:
            XML['cfdi:Comprobante']['MetodoPago'] === 'PUE' ? 1 : 2,
          serie: XML['cfdi:Comprobante']['Serie'],
          folio: XML['cfdi:Comprobante']['Folio'],
          nombre: XML['cfdi:Comprobante']['cfdi:Receptor']['Nombre'],
          total: XML['cfdi:Comprobante']['Total'],
          iva: XML['cfdi:Comprobante']['cfdi:Impuestos'][
            'TotalImpuestosTrasladados'
          ],
          subTotal: XML['cfdi:Comprobante']['SubTotal'],
          uuid: XML['cfdi:Comprobante']['cfdi:Complemento'][
            'tfd:TimbreFiscalDigital'
          ]['UUID'],
          fecha: XML['cfdi:Comprobante']['Fecha'].replace('T', ' '),
          metodoPago: XML['cfdi:Comprobante']['MetodoPago'],
          version: XML['cfdi:Comprobante']['Version'],
          uuidRelacionado: XML['cfdi:Comprobante']['cfdi:CfdiRelacionados']
            ? `,4,'${XML['cfdi:Comprobante']['cfdi:CfdiRelacionados']['cfdi:CfdiRelacionado']['UUID']}'`
            : '',
          noIdentificacion: concepto['NoIdentificacion'],
          unidad: concepto['Unidad'],
          descripcion: concepto['Descripcion'],
          importe: concepto['Importe'],
          claveProdServ: concepto['ClaveProdServ'],
          claveUnidad: concepto['ClaveUnidad'],
          cantidad: concepto['Cantidad'],
          impuestoConcepto:
            concepto['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'][
              'Importe'
            ],
          totalConcepto:
            parseFloat(concepto.Importe) +
            parseFloat(
              concepto['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado'][
                'Importe'
              ]
            ),
        };

        await renderToFolder(
          './single-parser/queries.sql',
          `./queries/${folder}/`,
          values
        );
      });
    }
  }
}

ls('./single-parser/xmls').catch(console.error);
