import fs from 'fs';
import parser from 'xml2json';
import templateFile from 'template-file';
import mergeFiles from 'merge-files';

async function lsXMLs(path) {
  const files = await fs.promises.readdir(path);
  const { renderToFolder } = templateFile;

  for (const file of files) {
    if (file !== '.DS_Store' && file !== '.gitkeep') {
      fs.readFile(`${path}/${file}`, async function (err, data) {
        const XML = JSON.parse(parser.toJson(data));

        const folder =
          XML['cfdi:Comprobante']['Serie'] + XML['cfdi:Comprobante']['Folio'];

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
        };

        await renderToFolder(
          './multi-parser/factura.sql',
          `./queries/${folder}/`,
          values
        );

        const conceptos =
          XML['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];

        conceptos.forEach(async (concepto) => {
          const conceptValues = {
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
            descuentoPorcentaje:
              concepto['Descuento'] > 0
                ? parseFloat(concepto.Importe) /
                  parseFloat(concepto['Descuento'])
                : 0,
          };

          const subFolder = `./queries/${folder}/${conceptValues.noIdentificacion}`;

          const data = Object.assign(values, conceptValues);

          await renderToFolder(
            './multi-parser/detalle-factura.sql',
            `${subFolder}/`,
            data
          );
          await renderToFolder(
            './multi-parser/detalle-impuesto.sql',
            `${subFolder}/`,
            data
          );
          await renderToFolder(
            './multi-parser/cargo.sql',
            `${subFolder}/`,
            data
          );
        });
      });
    }
  }
}

async function ls(path) {
  const dirs = await fs.promises.readdir(path);

  for (const dir of dirs) {
    if (dir !== '.DS_Store' && dir !== '.gitkeep') {
      let subDirs = await fs.promises.readdir(`${path}/${dir}`);

      const outputPath = `./queries/${dir}/queries.sql`;
      const files = [`./queries/${dir}/factura.sql`];

      subDirs = subDirs.filter((subDir) => !subDir.includes('.sql'));

      for (const subDir of subDirs) {
        files.push(`${path}/${dir}/${subDir}/detalle-factura.sql`);
        files.push(`${path}/${dir}/${subDir}/detalle-impuesto.sql`);
        files.push(`${path}/${dir}/${subDir}/cargo.sql`);
      }

      await mergeFiles(files, outputPath);
    }
  }
}

lsXMLs('./multi-parser/xmls').catch(console.error);
ls('./queries').catch(console.error);
