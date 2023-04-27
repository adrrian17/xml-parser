# XML Parser

Este proyecto contiene dos scripts que se usan para leer XMLs de facturas y comprobantes de pago para después generar los queries de SQL necesarios para registrarlos en Optimus.

## Instalación

Una vez descargado el repositorio en tu equipo, tienes que usar el comando `npm install` o `yarn install` desde la raíz del repositorio para instalar los módulos necesarios.

## Invoice Parser

Pasos para usar el script para las facturas es el siguiente:

1. Se deben poner todos los archivos XML en la carpeta `invoice-parser/xmls`
2. Se ejecuta el comando `yarn parse-invoices` o `npm run parse-invoices`
3. Los archivos SQL de cada factura se depositan en el folder `queries`

## REP Parser

Pasos para usar el script para los comprobantes de pago es el siguiente:

1. Se deben poner todos los archivos XML en la carpeta `rep-parser/xmls`
2. Se ejecuta el comando `yarn parse-reps` o `npm run parse-reps`
3. Los archivos SQL de cada factura se depositan en el folder `queries`
