fs = require('fs');
var parser = require('xml2json');

fs.readFile('./factura.xml', function (err, data) {
  var json = JSON.parse(parser.toJson(data));
  // console.log(json['cfdi:Comprobante']);

  const idCatFormaPago =
    json['cfdi:Comprobante']['MetodoPago'] === 'PUE' ? 1 : 2;

  const serie = json['cfdi:Comprobante']['Serie'];
  const folio = json['cfdi:Comprobante']['Folio'];
  const rfc = json['cfdi:Comprobante']['cfdi:Receptor']['Rfc'];
  const nombre = json['cfdi:Comprobante']['cfdi:Receptor']['Nombre'];
  const subTotal = json['cfdi:Comprobante']['SubTotal'];
  const total = json['cfdi:Comprobante']['Total'];
  const iva =
    json['cfdi:Comprobante']['cfdi:Impuestos']['TotalImpuestosTrasladados'];
  const uuid =
    json['cfdi:Comprobante']['cfdi:Complemento']['tfd:TimbreFiscalDigital'][
      'UUID'
    ];
  const fecha = json['cfdi:Comprobante']['Fecha'];
  const metodoPago = json['cfdi:Comprobante']['MetodoPago'];
  const uuidRelacionado = json['cfdi:Comprobante']['cfdi:CfdiRelacionados']
    ? json['cfdi:Comprobante']['cfdi:CfdiRelacionados']['cfdi:CfdiRelacionado'][
        'UUID'
      ]
    : null;
  const concepto = json['cfdi:Comprobante']['cfdi:Conceptos']['cfdi:Concepto'];
  const version = json['cfdi:Comprobante']['Version'];
  const totalConcepto =
    parseFloat(concepto.Importe) +
    parseFloat(
      concepto['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['Importe']
    );

  const dir = serie + folio;

  fs.mkdirSync(`./queries/${dir}`);

  fs.writeFile(
    `./queries/${dir}/insert-factura-${dir}.sql`,
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
      265542,${idCatFormaPago}, null,
      null,'${serie}',${folio},
      '${rfc}','${nombre}',0,
      1,0,${total},
      ${iva},${subTotal},'${uuid}',
      1,null,1,
      1,null,'${fecha}',
      null,'${fecha}',null,
      58703,1,'',
      '','I','MEX',
      'G03','${metodoPago}','MXN',
      '${version}'${uuidRelacionado ? `,4, ${uuidRelacionado}` : ''})
    
    INSERT INTO DetalleFactura (
      idFactura, idCatProducto, serie, 
      folio, rfc, uuid, 
      claveProducto, unidad, descripcion, 
      valorUnitario, importe, descuento, 
      descuentoPorcentaje, fechaCreacion, idUsuarioModifico, 
      claveProdServ, c_ClaveUnidad, cantidad
    ) VALUES (
      idFactura,idCatProducto,'${serie}',
      '${folio}','${rfc}','${uuid}',
      '${concepto['NoIdentificacion']}','${concepto['Unidad']}','${
      concepto['Descripcion']
    }',
      ${concepto['Importe']},${concepto['Importe']},0,
      0,'${fecha}',58703,
      ${concepto['ClaveProdServ']},'${concepto['ClaveUnidad']}',${
      concepto['Cantidad']
    }
    )
    
    INSERT INTO DetalleFacturaImpuesto(
      idDetalleFactura, idCatImpuesto, tasa, 
      valor, fechaCreacion, idUsuarioModifico, 
      c_impuesto, valorMaximo
    ) VALUES (
      idDetalleFactura,1,16,
      ${
        concepto['cfdi:Impuestos']['cfdi:Traslados']['cfdi:Traslado']['Importe']
      },'${fecha}',58703,
      2,0.16)

    INSERT INTO Cargo(
      idCliente, idFactura, valor, 
      valorPagado, valorSaldo, nombre, 
      descripcion, liquidado, fechaCreacion, 
      fechaModificacion, idUsuarioModifico
    ) VALUES (
      idCliente,idFactura,-${totalConcepto},
      0,'-${totalConcepto}','${concepto['NoIdentificacion']}',
      '${concepto['Descripcion']}',0,'${fecha}',
      NULL,58703
    )
    `,

    function (err) {
      if (err) throw err;
    }
  );
});
