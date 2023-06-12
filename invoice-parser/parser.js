import fs from 'fs/promises';
import parser from 'xml2json';
import templateFile from 'template-file';

function parseXMLs() {
  const basePath = './invoice-parser/xmls';
  const { renderFile } = templateFile;
  const dirs = fs.readdir(basePath);
  const string = [];

  dirs.then((subDirs) => {
    subDirs.shift();
    subDirs.shift();

    for (const dir of subDirs) {
      fs.readdir(`${basePath}/${dir}`).then((files) => {
        let xmlPath;

        if (files.length > 1) {
          xmlPath = `${basePath}/${dir}/${files[1]}`;
        } else {
          xmlPath = `${basePath}/${dir}/${files[0]}`;
        }

        fs.readFile(xmlPath)
          .then(async (content) => {
            const XML = JSON.parse(parser.toJson(content));

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
                    concepto['cfdi:Impuestos']['cfdi:Traslados'][
                      'cfdi:Traslado'
                    ]['Importe'],
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
            }

            const result = await renderFile(
              './invoice-parser/template.txt',
              values
            );

            string.push(result);
          })
          .then(() => {
            fs.writeFile('./SQL/queries.sql', string.join('\n\n'));
          });
      });
    }
  });
}

parseXMLs();
