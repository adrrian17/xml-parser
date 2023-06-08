import fs from 'fs';
import parser from 'xml2json';
import templateFile from 'template-file';
import path from 'path';
import async from 'async';

async function ls(directory) {
  const folders = await fs.promises.readdir(directory);
  const { renderFile } = templateFile;

  for (const folder of folders) {
    if (folder !== '.DS_Store' && folder !== '.gitkeep') {
      fs.readdir(`${directory}/${folder}`, async function (err, file) {
        let xmlPath;

        if (file.length > 1) {
          xmlPath = `${directory}/${folder}/${file[1]}`;
        } else {
          xmlPath = `${directory}/${folder}/${file[0]}`;
        }

        fs.readFile(xmlPath, async function (err, data) {
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
            conceptos: [],
          };

          if (values.uuidRelacionado !== '')
            values.columnasUuidRelacionado =
              ', satTipoRelacion, uuidsRelacionados';

          const conceptos =
            XML['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];

          if (Array.isArray(conceptos)) {
            conceptos.forEach(async (concepto) => {
              const conceptValues = {
                serie: values.serie,
                folio: values.folio,
                uuid: values.uuid,
                RFC: values.RFC,
                fecha: values.fecha,
                noIdentificacion: concepto['NoIdentificacion'],
                unidad: concepto['Unidad'],
                descripcion: concepto['Descripcion'],
                importe: concepto['Importe'],
                valorUnitario: concepto['ValorUnitario'],
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
                    concepto['cfdi:Impuestos']['cfdi:Traslados'][
                      'cfdi:Traslado'
                    ]['Importe']
                  ),
                descuentoPorcentaje:
                  concepto['Descuento'] > 0
                    ? parseFloat(concepto.Importe) /
                      parseFloat(concepto['Descuento'])
                    : 0,
              };
              values.conceptos.push(conceptValues);
            });
          } else {
            const concepto =
              XML['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];

            const conceptValues = {
              serie: values.serie,
              folio: values.folio,
              uuid: values.uuid,
              RFC: values.RFC,
              fecha: values.fecha,
              noIdentificacion: concepto['NoIdentificacion'],
              unidad: concepto['Unidad'],
              descripcion: concepto['Descripcion'],
              importe: concepto['Importe'],
              valorUnitario: concepto['ValorUnitario'],
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

            values.conceptos.push(conceptValues);
          }

          const SQL = await renderFile('./invoice-parser/template.sql', values);

          fs.writeFile(`./SQL/${values.RFC}.sql`, SQL, (err) => {
            if (err) console.log(err);
          });
        });
      });
    }
  }

  return new Promise((resolve, reject) => {
    fs.readdir('./SQL', (err, files) => {
      if (err) return reject(err);

      files = files.map((file) => path.join('./SQL', file));

      // Quita el .gitkeep y el .DS_Store
      files.shift();
      files.shift();

      async.map(files, fs.readFile, (err, results) => {
        if (err) return reject(err);

        fs.writeFile('./SQL/queries.sql', results.join('\n'), (err) => {
          if (err) return reject(err);

          resolve();
        });
      });
    });
  });
}

ls('./invoice-parser/xmls').catch(console.error);
