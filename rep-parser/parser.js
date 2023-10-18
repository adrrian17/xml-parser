import fs from 'fs/promises';
import parser from 'xml2json';
import templateFile from 'template-file';

function parseXMLs() {
  const basePath = './rep-parser/xmls';
  const { renderFile } = templateFile;
  const dirs = fs.readdir(basePath);
  const string = [];
  const date = new Date().toJSON();

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

            const concepto =
              XML['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];

            const values = {
              RFC: XML['cfdi:Comprobante']['cfdi:Receptor']['Rfc'],
              idCatFormaPago:
                XML['cfdi:Comprobante']['MetodoPago'] === 'PUE' ? 1 : 2,
              serie: XML['cfdi:Comprobante']['Serie'],
              folio: XML['cfdi:Comprobante']['Folio'],
              nombre: XML['cfdi:Comprobante']['cfdi:Receptor']['Nombre'],
              uuid: XML['cfdi:Comprobante']['cfdi:Complemento'][
                'tfd:TimbreFiscalDigital'
              ]['UUID'],
              fecha: XML['cfdi:Comprobante']['Fecha'].replace('T', ' '),
              version: XML['cfdi:Comprobante']['Version'],
              fechaCreacion: XML['cfdi:Comprobante']['cfdi:Complemento'][
                'tfd:TimbreFiscalDigital'
              ]['FechaTimbrado'].replace('T', ' '),
              claveProdServ: concepto['ClaveProdServ'],
              descripcion: concepto['Descripcion'],
              pagos: [],
            };

            const pagos =
              XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                'pago20:Pago'
              ];

            if (Array.isArray(pagos['pago20:DoctoRelacionado'])) {
              values.impPagado = pagos.Monto;
              values.fechaPago = pagos['FechaPago'].replace('T', ' ');
              values.fechaQuery = pagos['FechaPago'].substring(0, 10);

              pagos['pago20:DoctoRelacionado'].forEach((pago) => {
                const pagosValues = {
                  uuidRelacionado: pago['IdDocumento'],
                  impSaldoAnt: parseFloat(pago['ImpSaldoAnt']),
                  impSaldoInsoluto: parseFloat(pago['ImpSaldoInsoluto']),
                  impPagado: parseFloat(pago['ImpPagado']),
                  numParcialidad: pago['NumParcialidad'],
                  fechaPago: values.fechaPago,
                  fechaCreacion: values.fechaCreacion,
                };

                values.pagos.push(pagosValues);
              });
            } else {
              values.impPagado = pagos['pago20:DoctoRelacionado']['ImpPagado'];
              values.fechaPago = pagos['FechaPago'].replace('T', ' ');
              values.fechaQuery = pagos['FechaPago'].substring(0, 10);
              values.uuidRelacionado =
                pagos['pago20:DoctoRelacionado']['IdDocumento'];

              const pagosValues = {
                uuidRelacionado:
                  pagos['pago20:DoctoRelacionado']['IdDocumento'],
                impSaldoAnt: parseFloat(
                  pagos['pago20:DoctoRelacionado']['ImpSaldoAnt']
                ),
                impSaldoInsoluto: parseFloat(
                  pagos['pago20:DoctoRelacionado']['ImpSaldoInsoluto']
                ),
                impPagado: parseFloat(
                  pagos['pago20:DoctoRelacionado']['ImpPagado']
                ),
                numParcialidad:
                  pagos['pago20:DoctoRelacionado']['NumParcialidad'],
                fechaPago: values.fechaPago,
                fechaCreacion: values.fechaCreacion,
              };

              values.pagos.push(pagosValues);
            }

            const result = await renderFile(
              './rep-parser/template.txt',
              values
            );

            string.push(result);
          })
          .then(() => {
            fs.writeFile(`./SQL/reps-${date}.sql`, string.join('\n\n'));
          });
      });
    }
  });
}

parseXMLs();
