DECLARE @idCliente AS INT
DECLARE @idDomicilioReceptor AS INT
DECLARE @idDetalleFactura AS INT
DECLARE @claveProducto AS VARCHAR
DECLARE @idCatProducto AS INT
DECLARE @idFactura AS INT

SELECT 
  @idCliente=c.idcliente, 
  @idDomicilioReceptor=cd.idDomicilio
FROM cliente c with(nolock) 
INNER JOIN ClienteDomicilio cd with(nolock) on cd.idcliente = c.idCliente
WHERE c.rfc in ('{{RFC}}');

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
  @idCliente,1,1,
  1,5,@idDomicilioReceptor,
  265542,{{idCatFormaPago}}, null,
  null,'{{serie}}',{{folio}},
  '{{rfc}}','{{nombre}}',0,
  1,0,{{total}},
  {{iva}},{{subTotal}},'{{uuid}}',
  1,null,1,
  1,null,'{{fecha}}',
  null,'{{fecha}}',null,
  58703,1,'',
  '','I','MEX',
  'G03','{{metodoPago}}','MXN',
  '{{version}}'{{uuidRelacionado}}
)
/**/