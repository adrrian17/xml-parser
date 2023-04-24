SELECT 
  @claveProducto=claveproducto, 
  @idCatProducto=idcatproducto,
  fechaCreacion 
FROM CatProducto
WHERE claveProducto in ('{{noIdentificacion}}')
AND fechaCreación >= '2022-12-31 00:00:00'; 

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
  '{{folio}}','{{rfc}}','{{uuid}}',
  '{{noIdentificacion}}','{{unidad}}','{{descripcion}}',
  {{importe}},{{importe}},0,
  0,'{{fecha}}',58703,
  {{claveProdServ}},'{{claveUnidad}}',{{cantidad}}
)
/**/