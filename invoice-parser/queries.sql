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
  version{{columnasUuidRelacionado}}
) VALUES (
  @idCliente,1,1,
  1,5,@idDomicilioReceptor,
  265542,{{idCatFormaPago}}, null,
  null,'{{serie}}',{{folio}},
  '{{RFC}}','{{nombre}}',0,
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
{{#conceptos}}
SELECT 
  @claveProducto=claveproducto, 
  @idCatProducto=idcatproducto
FROM CatProducto
WHERE claveProducto in ('{{noIdentificacion}}')
AND fechaCreacion >= '2022-12-31 00:00:00';

SELECT
  @idFactura=f.idFactura
FROM factura f with(nolock)
INNER JOIN cliente c with(nolock) on f.idcliente = c.idcliente 
WHERE f.uuid IN ('{{uuid}}') 
AND f.idcliente IN (@idCliente)
ORDER BY f.idfactura;

INSERT INTO DetalleFactura (
  idFactura, idCatProducto, serie,
  folio, rfc, uuid,
  claveProducto, unidad, descripcion,
  valorUnitario, importe, descuento,
  descuentoPorcentaje, fechaCreacion, idUsuarioModifico,
  claveProdServ, c_ClaveUnidad, cantidad
) VALUES (
  @idFactura,@idCatProducto,'{{serie}}',
  '{{folio}}','{{RFC}}','{{uuid}}',
  '{{noIdentificacion}}','{{unidad}}','{{descripcion}}',
  {{valorUnitario}},{{importe}},0,
  0,'{{fecha}}',58703,
  {{claveProdServ}},'{{claveUnidad}}',{{cantidad}}
)

SELECT @idDetalleFactura=idDetalleFactura
FROM DetalleFactura 
WHERE idfactura in (@idFactura)
ORDER BY idFactura;

INSERT INTO DetalleFacturaImpuesto(
  idDetalleFactura, idCatImpuesto, tasa,
  valor, fechaCreacion, idUsuarioModifico,
  c_impuesto, valorMaximo
) VALUES (
  @idDetalleFactura,1,16,
  {{impuestoConcepto}},'{{fecha}}',58703,
  2,0.16
)

INSERT INTO Cargo(
  idCliente, idFactura, valor,
  valorPagado, valorSaldo, nombre,
  descripcion, liquidado, fechaCreacion,
  fechaModificacion, idUsuarioModifico
) VALUES (
  @idCliente,@idFactura,-{{totalConcepto}},
  0,'-{{totalConcepto}}','{{noIdentificacion}}',
  '{{descripcion}}',0,'{{fecha}}',
  NULL,58703
)
{{/conceptos}}