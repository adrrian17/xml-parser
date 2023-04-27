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

        await renderToFolder(
          './rep-parser/queries.sql',
          `./queries/${folder}/`,
          values
        );
      });
    }
  }
}

ls('./rep-parser/xmls').catch(console.error);
