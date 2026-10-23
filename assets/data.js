/* Envíos Gabi · datos de referencia y pedidos de ejemplo
   EXPRESOS sale de la hoja "Datos de los EXPRESOS" de la planilla.
   SEED son pedidos de ejemplo para que el sistema no arranque vacío. */

window.EXPRESOS = [
  ['TRANSPORTE MARMISSOLLE','Famatina 3305','CABA','8 a 16','4911-2850','',''],
  ['ORO NEGRO','Pergamino 3751, Nave A (Mód. 20 al 27), Villa Soldati','CABA','8 a 12 y 14 a 18','5091 9000','',''],
  ['CREDIFIN','Av. Presidente Perón 3599','MORÓN','8 a 16 hs','1134123599 / 1153513599','moron@credifinexpress.com.ar',''],
  ['VIA CARGO','Av. Hipólito Yrigoyen 717, B1708','MORÓN','9 a 18 hs','011 2253-6660','',''],
  ['BUSPACK','Av. Gral. Miguel de Azcuénaga 698','MORÓN','9 a 17 hs','','',''],
  ['ANDREANI','25 de Mayo 0479','MORÓN','8 a 18 hs','','',''],
  ['EXPRESO DEMONTE','Pergamino 3751, Predio CTC, Módulos C29, C30 y C31','CABA','8 a 17 hs','011 5275 1960','',''],
  ['TRANSPORTE LOJO','Av. Gral. Tomás de Iriarte 2767','CABA','8 a 17 hs','011 4301-0837','',''],
  ['SERVITRANS','José Martí 3464, Villa Soldati','CABA','8 a 16 hs','','',''],
  ['SNAIDER','Pergamino 3751, Predio CTC, Nave A (A1 a A5)','CABA','8 a 17 hs','','',''],
  ['EXPRESO GARCIA','California 1100, Barracas','CABA','8 a 16 hs','','',''],
  ['TRANSPORTE EL PAMPERO','Amancio Alcorta 1955','CABA','8 a 17 hs','1143054548','',''],
  ['LA SEVILLANITA','Pergamino 3751','CABA','9 a 17 hs','0810-444-7384','',''],
  ['EXPRESO SANTA ROSA','Pergamino 3751, Centro de Transferencia de Cargas, Nave 4, Mód. 109-110-111','CABA','8 a 16:30 hs','011-4600-7473 (74)','',''],
  ['TRANSPORTE BRECCIA','San Pedrito 3540','CABA','8 a 17 hs','4919-1485/1486','',''],
  ['VIA2','Intendente Fco. Rabanal 2756','CABA','9 a 18 hs','4919-8900 / 8167','',''],
  ['EXPRESO INTERPROVINCIAL','Zepita 3251, Barracas','CABA','10 a 16 hs','5197-2355','',''],
  ['EXPRESO TAS','Av. Int. Francisco Rabanal 3159','CABA','8 a 17 hs','','',''],
  ['SENDBOX','Blvd. Juan Manuel de Rosas 341, B1712','CASTELAR','8 a 17 hs','8109990284','',''],
  ['CRUZ DEL SUR','Av. Hipólito Yrigoyen 1421, B1708','MORÓN','8 a 17 hs','1125981114','',''],
  ['RODRIGUEZ HERMANOS','Erezcano 3880','CABA','8 a 17 hs','','','https://www.rht.com.ar/'],
  ['MALARGUE','Pergamino 3751','CABA','9 a 17 hs','','',''],
  ['TRANSPORTE MD','Castañón 3466','CABA','','','',''],
  ['TRANSPORTE SCORDINA','Av. Amancio Alcorta 3473','CABA','8 a 16 hs','(011) 4911-1044 / 4911-9514','','https://scordina.com/'],
  ['TRANS DAN','Aráoz de Lamadrid 1850','CABA','8 a 17 hs','(011) 4303-0915','info@tdexpress.com.ar',''],
  ['EXPRESO LO BRUNO','Murguiondo 3317','CABA','8 a 17 hs','4602-2892 / 6854','','https://expresolobruno.com.ar/'],
  ['A4 BAHIA','John W. Cooke 3255','CABA','8 a 17 hs','','',''],
  ['TRUCKS EXPRESS SRL','Julio Troxler 3220','CABA','8 a 17 hs','','',''],
  ['TRANSPORTE NICOLÁS GORGONE SRL','Salvigny 1564, Parque Chacabuco','CABA','','(011) 4924-3201/02','',''],
  ['TRANSPORTE PREMAT','Ferré 1501, Pompeya','CABA','8 a 16 hs','(011) 2073-9800','',''],
  ['EXPRESO TOKIO',"O'Gorman 3572, Villa Soldati",'CABA','','1159215634','','']
].map(([name, dir, loc, hor, tel, mail, web]) => ({ name, dir, loc, hor, tel, mail, web }));

window.SEED = (() => {
  const day = 864e5, T = Date.now();
  return [
    {id:'e1',kind:'envio',vend:'GK',fecha:'19/10',cli:'GIMENEZ JESUS EMANUEL',venta:'1444702',com:'Levantar RMA en Vía Cargo Morón',met:'Peugeot',ubic:'',tel:'',hor:'',monto:'',exp:'VIA CARGO',flag:'warn',arm:false,desp:false,t:T-5*day},
    {id:'e2',kind:'envio',vend:'GK',fecha:'20/10',cli:'GUSTAVO DANNUNZIO',venta:'1444810',com:'Datos cliente (reducir bultos)',met:'Expreso',ubic:'',tel:'',hor:'',monto:'150000',exp:'EXPRESO INTERPROVINCIAL',flag:'',arm:true,desp:false,t:T-4*day},
    {id:'e3',kind:'envio',vend:'GK',fecha:'20/10',cli:'DELEZ ADALBERTO',venta:'1444815',com:'Datos cliente',met:'Expreso',ubic:'',tel:'',hor:'',monto:'',exp:'',flag:'',arm:false,desp:false,t:T-3.9*day},
    {id:'e4',kind:'envio',vend:'GK',fecha:'20/10',cli:'DELEZ ADALBERTO',venta:'1444816',com:'Datos cliente',met:'Expreso',ubic:'',tel:'',hor:'',monto:'138000',exp:'Cargo Concepción del Uruguay',flag:'',arm:false,desp:false,t:T-3.8*day},
    {id:'e5',kind:'envio',vend:'GK',fecha:'20/10',cli:'PERRICONE MARCELO EDUARDO',venta:'1444830',com:'Av. 25 de Mayo 524. La vecina es Av. 25 de Mayo 518, ahí está Tomás, le pueden dejar las cosas sin drama.',met:'Hogareño',ubic:'Lanús Oeste',tel:'11 2724-5552',hor:'9:30 a 13 y 16 a 19',monto:'',exp:'',flag:'',arm:true,desp:false,t:T-3.5*day},
    {id:'e6',kind:'envio',vend:'GK',fecha:'20/10',cli:'MOREL MONICA',venta:'1444841',com:'Datos cliente',met:'Expreso',ubic:'',tel:'',hor:'',monto:'600000',exp:'IMAZ',flag:'stop',arm:true,desp:false,t:T-3*day},
    {id:'e7',kind:'envio',vend:'GK',fecha:'20/10',cli:'BIANCHINI FEDERICO ALEJO',venta:'1444858',com:'Ortiz Carlos 1249 · PC armada',met:'Hogareño',ubic:'Parque Chacabuco',tel:'11 5041-7741',hor:'15 a 21',monto:'',exp:'',flag:'tec',arm:true,desp:true,t:T-2*day},
    {id:'r1',kind:'retiro',vend:'GK',fecha:'20/10',cli:'CIP SEGURIDAD',venta:'1444720',com:'',met:'Retira cliente',flag:'stop',estado:'prep',t:T-4*day},
    {id:'r2',kind:'retiro',vend:'GK',fecha:'20/10',cli:'MAURO MEMMO',venta:'1444761',com:'',met:'Retira cliente',flag:'',estado:'prep',t:T-3*day},
    {id:'r3',kind:'retiro',vend:'GK',fecha:'20/10',cli:'MELAGINOS DAMIAN',venta:'1444799',com:'',met:'Retira cliente',flag:'',estado:'prep',t:T-2.5*day},
    {id:'r4',kind:'retiro',vend:'Gabriel',fecha:'20/10',cli:'IZAGUIRRE',venta:'1444870',com:'PC armada + monitor',met:'Retira cliente',flag:'tec',estado:'pend',t:T-1*day},
    {id:'h1',kind:'envio',vend:'Gabriel',fecha:'14/10',cli:'amonpulteam',venta:'1437984',com:'Contenera 1678, CP 1424, CABA',met:'Envío vehículo',ubic:'CABA',tel:'',hor:'9 a 17 hs',monto:'',exp:'Chofer Flex',flag:'',arm:true,desp:true,t:T-9*day,arch:T-6*day},
    {id:'h2',kind:'envio',vend:'Gabriel',fecha:'14/10',cli:'ceballos ana noemi',venta:'1439447',com:'Declarado pedido $ 450.000',met:'Expreso',ubic:'',tel:'',hor:'',monto:'450000',exp:'Transporte Dagol, Villarino',flag:'',arm:true,desp:true,t:T-9*day,arch:T-6*day},
    {id:'h3',kind:'envio',vend:'Gabriel',fecha:'15/10',cli:'Dicom',venta:'1441906',com:'Avisar al transportista que indica el cliente',met:'Expreso',ubic:'',tel:'',hor:'',monto:'',exp:'ORO NEGRO',flag:'',arm:true,desp:true,t:T-8*day,arch:T-5*day},
    {id:'h4',kind:'envio',vend:'Gabriel',fecha:'16/10',cli:'Rossi',venta:'1444408',com:'Valor declarado totalidad',met:'Expreso',ubic:'',tel:'',hor:'',monto:'',exp:'TRANSPORTE LOJO',flag:'',arm:true,desp:true,t:T-7*day,arch:T-4*day},
    {id:'h5',kind:'retiro',vend:'GK',fecha:'13/10',cli:'DESIMONI',venta:'1436120',com:'Cosas sueltas',met:'Retira cliente',flag:'',estado:'ret',t:T-10*day,arch:T-7*day},
    {id:'h6',kind:'retiro',vend:'GK',fecha:'15/10',cli:'FRATALOCH',venta:'1438211',com:'1 notebook',met:'Retira cliente',flag:'',estado:'ret',t:T-8*day,arch:T-6*day},
    {id:'h7',kind:'retiro',vend:'GK',fecha:'16/10',cli:'ST-NET',venta:'1439003',com:'Webcam',met:'Retira cliente',flag:'',estado:'ret',t:T-7*day,arch:T-5*day}
  ];
})();
