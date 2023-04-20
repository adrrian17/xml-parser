fs = require('fs');
var parser = require('xml2json');

fs.readFile('./factura.xml', function (err, data) {
  var json = JSON.parse(parser.toJson(data))['cfdi:Comprobante'];

  const serie = json['Serie'];
  const folio = json['Folio'];
  const rfc = json['cfdi:Receptor']['Rfc'];
  const nombre = json['cfdi:Receptor']['Nombre'];
  const uuid = json['cfdi:Complemento']['tfd:TimbreFiscalDigital']['UUID'];
  const fecha = json['Fecha'];
  const uuidRelacionado =
    json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
      'pago20:DoctoRelacionado'
    ]['IdDocumento'];
  const concepto = json['cfdi:Conceptos']['cfdi:Concepto'];
  const version = json['Version'];
  const numParcialidad =
    json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
      'pago20:DoctoRelacionado'
    ]['NumParcialidad'];
  const impSaldoAnt =
    json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
      'pago20:DoctoRelacionado'
    ]['ImpSaldoAnt'];
  const impSaldoInsoluto =
    json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
      'pago20:DoctoRelacionado'
    ]['ImpSaldoInsoluto'];
  const impPagado =
    json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
      'pago20:DoctoRelacionado'
    ]['ImpPagado'];
  const fechaPago = json['cfdi:Complemento']['pago20:Pagos']['pago20:Pago'][
    'FechaPago'
  ].replace('T', ' ');
  const fechaCreacion = json['cfdi:Complemento']['tfd:TimbreFiscalDigital'][
    'FechaTimbrado'
  ].replace('T', ' ');

  const dir = serie + folio;

  fs.mkdirSync(`./queries/${dir}`);

  fs.writeFile(
    `./queries/${dir}/insert-rep-${dir}.sql`,
    `
    INSERT INTO Factura(
      idCliente, idEmpresa, idCatTipoMoneda,
      idCatTipoComprobante, idCatMotivoDescuento, idDomicilioReceptor,
      idDomicilioEmisor, idCatFormaPago, idPedido,
      idFacturaRelacionada, serie, folio,
      rfc, razonSocial, descuento,
      vigente, conciliada, total,
      iva, subTotal, uuid,
      cambio, parcialidades, parcialidad,
      generaCorte, fechaMaximaPago, fechaFacturacion,
      fechaCancelacion, fechaCreacion, fechaModificacion,
      idUsuarioModifico, idCatEstatusFactura, observaciones,
      condicionesPago, cSatTipoDeComprobante, cSatPais,
      cSatUsoCFDI, cSatMetodoPago, cSatMoneda,
      version, satTipoRelacion, uuidsRelacionados
    ) VALUES (
      idCliente,1,1,
      1,5,idDomicilioReceptor,
      265542,2, null,
      null,'${serie}',${folio},
      '${rfc}','${nombre}',0,
      1,0,0,
      0,0,'${uuid}',
      1,null,1,
      1,null,'${fecha}',
      null,'${fecha}',null,
      58703,1,'',
      '','P','MEX',
      'CP01','PPD','MXN',
      '${version}'${uuidRelacionado ? `,null, '${uuidRelacionado}'` : ''})

    INSERT INTO DetalleFactura (
      idFactura, idCatProducto, serie,
      folio, rfc, uuid,
      claveProducto, unidad, descripcion,
      valorUnitario, importe, descuento,
      descuentoPorcentaje, fechaCreacion, idUsuarioModifico,
      claveProdServ, c_ClaveUnidad, cantidad
    ) VALUES (
      idFactura,null,'${serie}',
      '${folio}','${rfc}','${uuid}',
      null,null,'${concepto['Descripcion']}',
      0,0,0,
      0,'${fecha}',58703,
      ${concepto['ClaveProdServ']},null,1
    )

    INSERT INTO DetalleFacturaImpuesto(
      idDetalleFactura, idCatImpuesto, tasa,
      valor, fechaCreacion, idUsuarioModifico,
      c_impuesto, valorMaximo
    ) VALUES (
      idDetalleFactura,3,0,
      0,'${fecha}',58703,
      2,0.0)

    INSERT INTO ComprobantePagoConciliacion (
      idFactura,idComprobantePago,
      idConciliacion,parcialidad,saldoAnterior,
      saldoInsoluto,importeAplicado,vigente,
      fechaCreacion,idUsuarioModifico,fechaPago
    ) VALUES (
      703738,709648,
      123920,${numParcialidad},${impSaldoAnt},
      ${impSaldoInsoluto},${impPagado},1,
      '${fechaCreacion}',58703,'${fechaPago}'
    )
    `,

    function (err) {
      if (err) throw err;
    }
  );
});
