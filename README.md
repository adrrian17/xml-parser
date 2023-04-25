# XML Parser

Este proyecto contiene dos scripts que se usan para leer XMLs de facturas y comprobantes de pago para después generar los queries de SQL necesarios para registrarlos en Optimus.

## Invoice Parser

Pasos para usar el script para las facturas es el siguiente:

1. Se deben poner todos los archivos XML en la carpeta `invoice-parser/xmls`
2. Se ejecuta el comando `yarn invoice-parser` o `npm run invoice-parser`
3. Los archivos SQL de cada factura se depositan en el folder `queries`
