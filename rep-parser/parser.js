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
            };

            const pagos =
              XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                'pago20:Pago'
              ];

            if (pagos.length > 1) {
              let relacionados = '';

              values.uuidRelacionado =
                pagos[0]['pago20:DoctoRelacionado']['IdDocumento'];
              values.numParcialidad =
                pagos[0]['pago20:DoctoRelacionado']['NumParcialidad'];

              values.impSaldoAnt = 0;
              values.impSaldoInsoluto = 0;
              values.impPagado = 0;

              values.fechaPago = pagos[0]['FechaPago'].replace('T', ' ');
              values.fechaQuery = pagos[0]['FechaPago'].substring(0, 10);

              pagos.forEach((pago) => {
                const data = pago['pago20:DoctoRelacionado'];

                relacionados = `,${data['IdDocumento']}` + relacionados;
                values.impSaldoAnt += parseFloat(data['ImpSaldoAnt']);
                values.impSaldoInsoluto += parseFloat(data['ImpSaldoInsoluto']);
                values.impPagado += parseFloat(data['ImpPagado']);
              });

              values.relacionados = `,null, '${relacionados.substring(1)}'`;
            } else {
              values.relacionados = `,null,'${pagos['pago20:DoctoRelacionado']['IdDocumento']}'`;
              values.uuidRelacionado =
                pagos['pago20:DoctoRelacionado']['IdDocumento'];
              values.numParcialidad =
                pagos['pago20:DoctoRelacionado']['NumParcialidad'];
              values.impSaldoAnt =
                pagos['pago20:DoctoRelacionado']['ImpSaldoAnt'];
              values.impSaldoInsoluto =
                pagos['pago20:DoctoRelacionado']['ImpSaldoInsoluto'];
              values.impPagado = pagos['pago20:DoctoRelacionado']['ImpPagado'];
              values.fechaPago = pagos['FechaPago'].replace('T', ' ');
              values.fechaQuery = pagos['FechaPago'].substring(0, 10);
            }

            const result = await renderFile(
              './rep-parser/template.txt',
              values
            );

            string.push(result);
          })
          .then(() => {
            fs.writeFile(`./SQL/queries-${date}.sql`, string.join('\n\n'));
          });
      });
    }
  });
}

parseXMLs();
