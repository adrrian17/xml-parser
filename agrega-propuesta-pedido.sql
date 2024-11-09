USE OptimusDB

SELECT idPedido, rfc
-- UPDATE f SET idPedido = 366373
FROM Factura f
WHERE serie = 'SE' AND folio = 5300
