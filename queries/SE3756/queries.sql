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
WHERE c.rfc in ('EFE220808735');

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
  265542,2, null,
  null,'SE',3756,
  '','EFECTIFINTECH',0,
  1,0,83866.84,
  11567.84,108299.00,'8624f738-6a9b-422a-b3d4-ad452a18ebc0',
  1,null,1,
  1,null,'2023-04-18 14:35:18',
  null,'2023-04-18 14:35:18',null,
  58703,1,'',
  '','I','MEX',
  'G03','PPD','MXN',
  '4.0'
)
SELECT 
  @claveProducto=claveproducto, 
  @idCatProducto=idcatproducto,
  fechaCreacion 
FROM CatProducto
WHERE claveProducto in ('CF-0302-01')
AND fechaCreación >= '2022-12-31 00:00:00'; 

SELECT
  @idFactura=f.idFactura
FROM factura f with(nolock)
INNER JOIN cliente c with(nolock) on f.idcliente = c.idcliente 
WHERE f.uuid IN ('') 
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
  @idFactura,@idCatProducto,'',
  '','','',
  'CF-0302-01','servicio','Suscripción anual a Conector Fiscal Corporativo para la gestión de Comprobantes Fiscales Digitales que incluye: A) Uso del servicio para 1 RFC (contribuyente emisor). B) Hasta 11,700 comprobantes sin costo. C) Plantilla genérica para la impresión de los CFDIs. D) Almacenamiento de documentos por 12 meses. E) Acceso para usuarios ilimitados. F) Validación de CFDIs de proveedores. G) Web Service para automatización de reportes alto volumen. H) Servicio de tracking de envio de CFDIs. I) Soporte por Mail, Chat y Teléfono. J) 3 horas de videoconferencia.',
  ,15399,0,
  0,'',58703,
  81111800,'E48',1
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
  2463.84,'',58703,
  2,0.16
)

INSERT INTO Cargo(
  idCliente, idFactura, valor,
  valorPagado, valorSaldo, nombre,
  descripcion, liquidado, fechaCreacion,
  fechaModificacion, idUsuarioModifico
) VALUES (
  @idCliente,@idFactura,-17862.84,
  0,'-17862.84','CF-0302-01',
  'Suscripción anual a Conector Fiscal Corporativo para la gestión de Comprobantes Fiscales Digitales que incluye: A) Uso del servicio para 1 RFC (contribuyente emisor). B) Hasta 11,700 comprobantes sin costo. C) Plantilla genérica para la impresión de los CFDIs. D) Almacenamiento de documentos por 12 meses. E) Acceso para usuarios ilimitados. F) Validación de CFDIs de proveedores. G) Web Service para automatización de reportes alto volumen. H) Servicio de tracking de envio de CFDIs. I) Soporte por Mail, Chat y Teléfono. J) 3 horas de videoconferencia.',0,'',
  NULL,58703
)
SELECT 
  @claveProducto=claveproducto, 
  @idCatProducto=idcatproducto,
  fechaCreacion 
FROM CatProducto
WHERE claveProducto in ('CF-SEIM-01')
AND fechaCreación >= '2022-12-31 00:00:00'; 

SELECT
  @idFactura=f.idFactura
FROM factura f with(nolock)
INNER JOIN cliente c with(nolock) on f.idcliente = c.idcliente 
WHERE f.uuid IN ('') 
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
  @idFactura,@idCatProducto,'',
  '','','',
  'CF-SEIM-01','servicio','Implementación y/o configuración de servicios o módulos',
  ,20900,0,
  0,'',58703,
  81111800,'E48',1
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
  3344,'',58703,
  2,0.16
)

INSERT INTO Cargo(
  idCliente, idFactura, valor,
  valorPagado, valorSaldo, nombre,
  descripcion, liquidado, fechaCreacion,
  fechaModificacion, idUsuarioModifico
) VALUES (
  @idCliente,@idFactura,-24244,
  0,'-24244','CF-SEIM-01',
  'Implementación y/o configuración de servicios o módulos',0,'',
  NULL,58703
)
SELECT 
  @claveProducto=claveproducto, 
  @idCatProducto=idcatproducto,
  fechaCreacion 
FROM CatProducto
WHERE claveProducto in ('CF-TR00-02')
AND fechaCreación >= '2022-12-31 00:00:00'; 

SELECT
  @idFactura=f.idFactura
FROM factura f with(nolock)
INNER JOIN cliente c with(nolock) on f.idcliente = c.idcliente 
WHERE f.uuid IN ('') 
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
  @idFactura,@idCatProducto,'',
  '','','',
  'CF-TR00-02','transacciones','Emisión y certificación o recepción y validación de CFDIs',
  ,72000,0,
  0,'',58703,
  81111800,'E55',120000
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
  5760,'',58703,
  2,0.16
)

INSERT INTO Cargo(
  idCliente, idFactura, valor,
  valorPagado, valorSaldo, nombre,
  descripcion, liquidado, fechaCreacion,
  fechaModificacion, idUsuarioModifico
) VALUES (
  @idCliente,@idFactura,-77760,
  0,'-77760','CF-TR00-02',
  'Emisión y certificación o recepción y validación de CFDIs',0,'',
  NULL,58703
)