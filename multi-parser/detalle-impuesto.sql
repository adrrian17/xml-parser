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
/**/