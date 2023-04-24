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
/**/