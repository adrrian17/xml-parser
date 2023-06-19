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
              relacionados: `,null,'${XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos']['pago20:Pago']['pago20:DoctoRelacionado']['IdDocumento']}'`,
              uuidRelacionado:
                XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                  'pago20:Pago'
                ]['pago20:DoctoRelacionado']['IdDocumento'],
              claveProdServ: concepto['ClaveProdServ'],
              descripcion: concepto['Descripcion'],
              numParcialidad:
                XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                  'pago20:Pago'
                ]['pago20:DoctoRelacionado']['NumParcialidad'],
              impSaldoAnt:
                XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                  'pago20:Pago'
                ]['pago20:DoctoRelacionado']['ImpSaldoAnt'],
              impSaldoInsoluto:
                XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                  'pago20:Pago'
                ]['pago20:DoctoRelacionado']['ImpSaldoInsoluto'],
              impPagado:
                XML['cfdi:Comprobante']['cfdi:Complemento']['pago20:Pagos'][
                  'pago20:Pago'
                ]['pago20:DoctoRelacionado']['ImpPagado'],
              fechaPago: XML['cfdi:Comprobante']['cfdi:Complemento'][
                'pago20:Pagos'
              ]['pago20:Pago']['FechaPago'].replace('T', ' '),
              fechaCreacion: XML['cfdi:Comprobante']['cfdi:Complemento'][
                'tfd:TimbreFiscalDigital'
              ]['FechaTimbrado'].replace('T', ' '),
              fechaQuery: XML['cfdi:Comprobante']['cfdi:Complemento'][
                'pago20:Pagos'
              ]['pago20:Pago']['FechaPago'].substring(0, 10),
            };

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
