import React, { useState, useMemo, useRef, useEffect } from 'react';

/* Copa do Mundo FIFA 2026 - Simulador Monte Carlo v5 */

const PO={UEFA_A:{t:['Bosnia and Herzegovina','Italy'],l:'UEFA A: Bósnia 1(4)-1(1) Itália',w:0},UEFA_B:{t:['Sweden','Poland'],l:'UEFA B: Suécia 3-2 Polônia',w:0},UEFA_C:{t:['Türkiye','Kosovo'],l:'UEFA C: Turquia 1-0 Kosovo',w:0},UEFA_D:{t:['Czechia','Denmark'],l:'UEFA D: Tchéquia 2(3)-2(1) Dinamarca',w:0},IC1:{t:['DR Congo','Jamaica'],l:'IC1: RD Congo 1-0 Jamaica (AET)',w:0},IC2:{t:['Iraq','Bolivia'],l:'IC2: Iraque 2-1 Bolívia',w:0}}

const PT={'Spain':'Espanha','Argentina':'Argentina','France':'França','England':'Inglaterra','Brazil':'Brasil','Portugal':'Portugal','Netherlands':'Holanda','Morocco':'Marrocos','Belgium':'Bélgica','Germany':'Alemanha','Croatia':'Croácia','Senegal':'Senegal','Italy':'Itália','Colombia':'Colômbia','USA':'EUA','Mexico':'México','Uruguay':'Uruguai','Switzerland':'Suíça','Japan':'Japão','Iran':'Irã','Denmark':'Dinamarca','South Korea':'Coreia do Sul','Ecuador':'Equador','Austria':'Áustria','Türkiye':'Turquia','Australia':'Austrália','Algeria':'Argélia','Canada':'Canadá','Uzbekistan':'Uzbequistão','Egypt':'Egito','Norway':'Noruega','Paraguay':'Paraguai','Jordan':'Jordânia','Scotland':'Escócia','Czechia':'Tchéquia','Tunisia':'Tunísia','Saudi Arabia':'Arábia Saudita','Ivory Coast':'Costa do Marfim','Bosnia and Herzegovina':'Bósnia','Qatar':'Catar','Ghana':'Gana','South Africa':'África do Sul','DR Congo':'RD Congo','Kosovo':'Kosovo','Cape Verde':'Cabo Verde','Jamaica':'Jamaica','Panama':'Panamá','New Zealand':'Nova Zelândia','Haiti':'Haiti','Curaçao':'Curaçao','Sweden':'Suécia','Poland':'Polônia','Iraq':'Iraque','Bolivia':'Bolívia'};

// FIFA Ranking (1/Abr/2026, oficial — pontos exatos top 40, estimados 41+)
const FP={'Spain':1876,'Argentina':1875,'France':1877,'England':1826,'Brazil':1761,'Portugal':1764,'Netherlands':1758,'Morocco':1756,'Belgium':1735,'Germany':1730,'Croatia':1717,'Senegal':1689,'Italy':1700,'Colombia':1693,'USA':1673,'Mexico':1681,'Uruguay':1673,'Switzerland':1649,'Japan':1660,'Iran':1615,'Denmark':1621,'South Korea':1589,'Ecuador':1595,'Austria':1593,'Türkiye':1599,'Australia':1581,'Algeria':1564,'Canada':1556,'Egypt':1563,'Norway':1551,'Paraguay':1504,'Scotland':1490,'Czechia':1499,'Tunisia':1485,'Saudi Arabia':1400,'Ivory Coast':1533,'Qatar':1430,'Ghana':1340,'South Africa':1405,'Cape Verde':1360,'Panama':1541,'New Zealand':1295,'Haiti':1305,'Uzbekistan':1455,'Jordan':1390,'Curaçao':1310,'Sweden':1515,'Poland':1528,'Kosovo':1315,'Bosnia and Herzegovina':1380,'DR Congo':1475,'Jamaica':1350,'Iraq':1420,'Bolivia':1325};

// Elo Ratings (eloratings.net 24/Mai/2026 — 48 classificados; perdedores de repescagem mantidos estimados)
const ELO={'Spain':2155,'Argentina':2113,'France':2062,'England':2020,'Brazil':1988,'Portugal':1984,'Netherlands':1944,'Morocco':1824,'Belgium':1888,'Germany':1925,'Croatia':1908,'Senegal':1867,'Italy':1859,'Colombia':1977,'USA':1733,'Mexico':1867,'Uruguay':1892,'Switzerland':1894,'Japan':1906,'Iran':1772,'Denmark':1864,'South Korea':1758,'Ecuador':1935,'Austria':1830,'Türkiye':1906,'Australia':1774,'Algeria':1760,'Canada':1793,'Egypt':1699,'Norway':1917,'Paraguay':1832,'Scotland':1770,'Czechia':1733,'Tunisia':1633,'Saudi Arabia':1566,'Ivory Coast':1695,'Qatar':1423,'Ghana':1510,'South Africa':1518,'Cape Verde':1576,'Panama':1734,'New Zealand':1563,'Haiti':1554,'Uzbekistan':1718,'Jordan':1685,'Curaçao':1433,'Sweden':1712,'Poland':1740,'Kosovo':1670,'Bosnia and Herzegovina':1591,'DR Congo':1661,'Jamaica':1600,'Iraq':1618,'Bolivia':1570};

// Implied Elo from betting odds (Mar/2026) -- calibrated: Elo = 2509 + 176×ln(p/100)
const BET={'Spain':2199,'England':2140,'France':2124,'Argentina':2093,'Brazil':2091,'Portugal':2067,'Germany':1992,'Norway':1898,'Netherlands':1892,'Belgium':1860,'USA':1860,'Colombia':1829,'Croatia':1820,'Morocco':1770,'Mexico':1758,'Japan':1715,'Uruguay':1715,'Austria':1698,'Australia':1698,'Canada':1698,'Switzerland':1698,'Denmark':1630,'Ecuador':1610,'Senegal':1590,'South Korea':1580,'Türkiye':1570,'Italy':1860,'Algeria':1500,'Egypt':1490,'Iran':1490,'Paraguay':1480,'Scotland':1470,'Poland':1470,'Sweden':1470,'Czechia':1450,'Tunisia':1430,'Saudi Arabia':1420,'Ivory Coast':1460,'Ghana':1400,'South Africa':1390,'Panama':1440,'Qatar':1380,'Cape Verde':1370,'New Zealand':1360,'Jordan':1380,'Uzbekistan':1380,'DR Congo':1400,'Haiti':1350,'Jamaica':1350,'Curaçao':1300,'Kosovo':1380,'Iraq':1380,'Bolivia':1350,'Bosnia and Herzegovina':1420};

// PELE Rating (Silver Bulletin / silverbulletin — atualizado Mai/2026 via CSV completo do usuário)
const PELE={'Spain':2077,'Argentina':2065,'France':2026,'England':2027,'Brazil':1989,'Portugal':1972,'Netherlands':1939,'Morocco':1866,'Belgium':1892,'Germany':1975,'Croatia':1877,'Senegal':1897,'Italy':1897,'Colombia':1949,'USA':1810,'Mexico':1853,'Uruguay':1931,'Switzerland':1889,'Japan':1872,'Iran':1722,'Denmark':1864,'South Korea':1770,'Ecuador':1932,'Austria':1832,'Türkiye':1909,'Australia':1772,'Algeria':1794,'Canada':1806,'Egypt':1770,'Norway':1953,'Paraguay':1855,'Scotland':1802,'Czechia':1769,'Tunisia':1695,'Saudi Arabia':1632,'Ivory Coast':1777,'Qatar':1550,'Ghana':1662,'South Africa':1667,'Cape Verde':1621,'Panama':1739,'New Zealand':1639,'Haiti':1637,'Uzbekistan':1714,'Jordan':1661,'Curaçao':1570,'Sweden':1781,'Poland':1779,'Kosovo':1737,'Bosnia and Herzegovina':1706,'DR Congo':1729,'Jamaica':1611,'Iraq':1653,'Bolivia':1656};

// PELE Estimado — não consta na fonte WC PELE das figuras (seleções de playoff não classificadas). Flag para a UI.
const PELE_EST=new Set(['Italy','Denmark','Poland','Kosovo','Jamaica','Bolivia']);

// TILT Total — fator que muda o total de gols esperados na partida (atacante = mais gols, defensivo = menos). Match tilt = soma dos dois times. Atualizado Mai/2026.
const TILT={'Spain':.08,'Argentina':-.11,'France':-.03,'England':-.11,'Brazil':.01,'Portugal':.03,'Netherlands':.17,'Morocco':-.44,'Belgium':.21,'Germany':.55,'Croatia':0,'Senegal':-.32,'Italy':-.34,'Colombia':-.25,'USA':.11,'Mexico':-.20,'Uruguay':-.17,'Switzerland':.09,'Japan':.08,'Iran':-.16,'Denmark':.11,'South Korea':-.17,'Ecuador':-.24,'Austria':.22,'Türkiye':.25,'Australia':-.12,'Algeria':.08,'Canada':-.07,'Egypt':-.09,'Norway':.23,'Paraguay':-.20,'Scotland':-.06,'Czechia':.09,'Tunisia':-.20,'Saudi Arabia':-.24,'Ivory Coast':-.06,'Qatar':.15,'Ghana':-.10,'South Africa':-.23,'Cape Verde':-.28,'Panama':-.04,'New Zealand':-.01,'Haiti':.23,'Uzbekistan':-.02,'Jordan':-.05,'Curaçao':.03,'Sweden':.18,'Poland':.15,'Kosovo':.04,'Bosnia and Herzegovina':.14,'DR Congo':-.07,'Jamaica':-.22,'Iraq':-.17,'Bolivia':.17};

const FL={'Spain':'🇪🇸','Argentina':'🇦🇷','France':'🇫🇷','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Brazil':'🇧🇷','Portugal':'🇵🇹','Netherlands':'🇳🇱','Morocco':'🇲🇦','Belgium':'🇧🇪','Germany':'🇩🇪','Croatia':'🇭🇷','Senegal':'🇸🇳','Italy':'🇮🇹','Colombia':'🇨🇴','USA':'🇺🇸','Mexico':'🇲🇽','Uruguay':'🇺🇾','Switzerland':'🇨🇭','Japan':'🇯🇵','Iran':'🇮🇷','Denmark':'🇩🇰','South Korea':'🇰🇷','Ecuador':'🇪🇨','Austria':'🇦🇹','Türkiye':'🇹🇷','Australia':'🇦🇺','Algeria':'🇩🇿','Canada':'🇨🇦','Egypt':'🇪🇬','Norway':'🇳🇴','Paraguay':'🇵🇾','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Tunisia':'🇹🇳','Saudi Arabia':'🇸🇦','Ivory Coast':'🇨🇮','Qatar':'🇶🇦','Ghana':'🇬🇭','South Africa':'🇿🇦','Cape Verde':'🇨🇻','Panama':'🇵🇦','New Zealand':'🇳🇿','Haiti':'🇭🇹','Uzbekistan':'🇺🇿','Jordan':'🇯🇴','Curaçao':'🇨🇼','Sweden':'🇸🇪','Poland':'🇵🇱','Kosovo':'🇽🇰','Czechia':'🇨🇿','Bosnia and Herzegovina':'🇧🇦','DR Congo':'🇨🇩','Jamaica':'🇯🇲','Iraq':'🇮🇶','Bolivia':'🇧🇴'};

const CF={'Spain':'UEFA','Argentina':'CONMEBOL','France':'UEFA','England':'UEFA','Brazil':'CONMEBOL','Portugal':'UEFA','Netherlands':'UEFA','Morocco':'CAF','Belgium':'UEFA','Germany':'UEFA','Croatia':'UEFA','Senegal':'CAF','Italy':'UEFA','Colombia':'CONMEBOL','USA':'CONCACAF','Mexico':'CONCACAF','Uruguay':'CONMEBOL','Switzerland':'UEFA','Japan':'AFC','Iran':'AFC','Denmark':'UEFA','South Korea':'AFC','Ecuador':'CONMEBOL','Austria':'UEFA','Türkiye':'UEFA','Australia':'AFC','Algeria':'CAF','Canada':'CONCACAF','Egypt':'CAF','Norway':'UEFA','Paraguay':'CONMEBOL','Scotland':'UEFA','Tunisia':'CAF','Saudi Arabia':'AFC','Ivory Coast':'CAF','Qatar':'AFC','Ghana':'CAF','South Africa':'CAF','Cape Verde':'CAF','Panama':'CONCACAF','New Zealand':'OFC','Haiti':'CONCACAF','Uzbekistan':'AFC','Jordan':'AFC','Curaçao':'CONCACAF','Sweden':'UEFA','Poland':'UEFA','Kosovo':'UEFA','Czechia':'UEFA','Bosnia and Herzegovina':'UEFA','DR Congo':'CAF','Jamaica':'CONCACAF','Iraq':'AFC','Bolivia':'CONMEBOL'};

const GT={A:['Mexico','South Africa','South Korea','UEFA_D'],B:['Canada','UEFA_A','Qatar','Switzerland'],C:['Brazil','Morocco','Haiti','Scotland'],D:['USA','Paraguay','Australia','UEFA_C'],E:['Germany','Curaçao','Ivory Coast','Ecuador'],F:['Netherlands','Japan','UEFA_B','Tunisia'],G:['Belgium','Egypt','Iran','New Zealand'],H:['Spain','Cape Verde','Saudi Arabia','Uruguay'],I:['France','Senegal','IC2','Norway'],J:['Argentina','Algeria','Austria','Jordan'],K:['Portugal','IC1','Uzbekistan','Colombia'],L:['England','Croatia','Ghana','Panama']};

const POOLS={A:'CEFHI',B:'EFGIJ',D:'BEFIJ',E:'ABCDF',G:'AEHIJ',I:'CDFGH',K:'DEIJL',L:'EHIJK'};
const W3=['A','B','D','E','G','I','K','L'];

const AC_RAW='ABCDEFGH:HGBCAFDE|ABCDEFGI:CGBDAFEI|ABCDEFGJ:CGBDAFEJ|ABCDEFGK:CGBDAFEK|ABCDEFGL:CGBDAFLE|ABCDEFHI:HEBCAFDI|ABCDEFHJ:HJBCAFDE|ABCDEFHK:HEBCAFDK|ABCDEFHL:HFBCADLE|ABCDEFIJ:CJBDAFEI|ABCDEFIK:CEBDAFIK|ABCDEFIL:CEBDAFLI|ABCDEFJK:CJBDAFEK|ABCDEFJL:CJBDAFLE|ABCDEFKL:CEBDAFLK|ABCDEGHI:HGBCADEI|ABCDEGHJ:HGBCADEJ|ABCDEGHK:HGBCADEK|ABCDEGHL:HGBCADLE|ABCDEGIJ:EGBCADIJ|ABCDEGIK:EGBCADIK|ABCDEGIL:EGBCADLI|ABCDEGJK:EGBCADJK|ABCDEGJL:EGBCADLJ|ABCDEGKL:EGBCADLK|ABCDEHIJ:HJBCADEI|ABCDEHIK:HEBCADIK|ABCDEHIL:HEBCADLI|ABCDEHJK:HJBCADEK|ABCDEHJL:HJBCADLE|ABCDEHKL:HEBCADLK|ABCDEIJK:EJBCADIK|ABCDEIJL:EJBCADLI|ABCDEIKL:EIBCADLK|ABCDEJKL:EJBCADLK|ABCDFGHI:HGBCAFDI|ABCDFGHJ:HGBCAFDJ|ABCDFGHK:HGBCAFDK|ABCDFGHL:CGBDAFLH|ABCDFGIJ:CGBDAFIJ|ABCDFGIK:CGBDAFIK|ABCDFGIL:CGBDAFLI|ABCDFGJK:CGBDAFJK|ABCDFGJL:CGBDAFLJ|ABCDFGKL:CGBDAFLK|ABCDFHIJ:HJBCAFDI|ABCDFHIK:HFBCADIK|ABCDFHIL:HFBCADLI|ABCDFHJK:HJBCAFDK|ABCDFHJL:CJBDAFLH|ABCDFHKL:HFBCADLK|ABCDFIJK:CJBDAFIK|ABCDFIJL:CJBDAFLI|ABCDFIKL:CIBDAFLK|ABCDFJKL:CJBDAFLK|ABCDGHIJ:HGBCADIJ|ABCDGHIK:HGBCADIK|ABCDGHIL:HGBCADLI|ABCDGHJK:HGBCADJK|ABCDGHJL:HGBCADLJ|ABCDGHKL:HGBCADLK|ABCDGIJK:CJBDAGIK|ABCDGIJL:CJBDAGLI|ABCDGIKL:IGBCADLK|ABCDGJKL:CJBDAGLK|ABCDHIJK:HJBCADIK|ABCDHIJL:HJBCADLI|ABCDHIKL:HIBCADLK|ABCDHJKL:HJBCADLK|ABCDIJKL:IJBCADLK|ABCEFGHI:HGBCAFEI|ABCEFGHJ:HGBCAFEJ|ABCEFGHK:HGBCAFEK|ABCEFGHL:HGBCAFLE|ABCEFGIJ:EGBCAFIJ|ABCEFGIK:EGBCAFIK|ABCEFGIL:EGBCAFLI|ABCEFGJK:EGBCAFJK|ABCEFGJL:EGBCAFLJ|ABCEFGKL:EGBCAFLK|ABCEFHIJ:HJBCAFEI|ABCEFHIK:HEBCAFIK|ABCEFHIL:HEBCAFLI|ABCEFHJK:HJBCAFEK|ABCEFHJL:HJBCAFLE|ABCEFHKL:HEBCAFLK|ABCEFIJK:EJBCAFIK|ABCEFIJL:EJBCAFLI|ABCEFIKL:EIBCAFLK|ABCEFJKL:EJBCAFLK|ABCEGHIJ:HJBCAGEI|ABCEGHIK:EGBCAHIK|ABCEGHIL:EGBCAHLI|ABCEGHJK:HJBCAGEK|ABCEGHJL:HJBCAGLE|ABCEGHKL:EGBCAHLK|ABCEGIJK:EJBCAGIK|ABCEGIJL:EJBCAGLI|ABCEGIKL:EGBAICLK|ABCEGJKL:EJBCAGLK|ABCEHIJK:EJBCAHIK|ABCEHIJL:EJBCAHLI|ABCEHIKL:EIBCAHLK|ABCEHJKL:EJBCAHLK|ABCEIJKL:EJBAICLK|ABCFGHIJ:HGBCAFIJ|ABCFGHIK:HGBCAFIK|ABCFGHIL:HGBCAFLI|ABCFGHJK:HGBCAFJK|ABCFGHJL:HGBCAFLJ|ABCFGHKL:HGBCAFLK|ABCFGIJK:CJBFAGIK|ABCFGIJL:CJBFAGLI|ABCFGIKL:IGBCAFLK|ABCFGJKL:CJBFAGLK|ABCFHIJK:HJBCAFIK|ABCFHIJL:HJBCAFLI|ABCFHIKL:HIBCAFLK|ABCFHJKL:HJBCAFLK|ABCFIJKL:IJBCAFLK|ABCGHIJK:HJBCAGIK|ABCGHIJL:HJBCAGLI|ABCGHIKL:IGBCAHLK|ABCGHJKL:HJBCAGLK|ABCGIJKL:IJBCAGLK|ABCHIJKL:IJBCAHLK|ABDEFGHI:HGBDAFEI|ABDEFGHJ:HGBDAFEJ|ABDEFGHK:HGBDAFEK|ABDEFGHL:HGBDAFLE|ABDEFGIJ:EGBDAFIJ|ABDEFGIK:EGBDAFIK|ABDEFGIL:EGBDAFLI|ABDEFGJK:EGBDAFJK|ABDEFGJL:EGBDAFLJ|ABDEFGKL:EGBDAFLK|ABDEFHIJ:HJBDAFEI|ABDEFHIK:HEBDAFIK|ABDEFHIL:HEBDAFLI|ABDEFHJK:HJBDAFEK|ABDEFHJL:HJBDAFLE|ABDEFHKL:HEBDAFLK|ABDEFIJK:EJBDAFIK|ABDEFIJL:EJBDAFLI|ABDEFIKL:EIBDAFLK|ABDEFJKL:EJBDAFLK|ABDEGHIJ:HJBDAGEI|ABDEGHIK:EGBDAHIK|ABDEGHIL:EGBDAHLI|ABDEGHJK:HJBDAGEK|ABDEGHJL:HJBDAGLE|ABDEGHKL:EGBDAHLK|ABDEGIJK:EJBDAGIK|ABDEGIJL:EJBDAGLI|ABDEGIKL:EGBAIDLK|ABDEGJKL:EJBDAGLK|ABDEHIJK:EJBDAHIK|ABDEHIJL:EJBDAHLI|ABDEHIKL:EIBDAHLK|ABDEHJKL:EJBDAHLK|ABDEIJKL:EJBAIDLK|ABDFGHIJ:HGBDAFIJ|ABDFGHIK:HGBDAFIK|ABDFGHIL:HGBDAFLI|ABDFGHJK:HGBDAFJK|ABDFGHJL:HGBDAFLJ|ABDFGHKL:HGBDAFLK|ABDFGIJK:FJBDAGIK|ABDFGIJL:FJBDAGLI|ABDFGIKL:IGBDAFLK|ABDFGJKL:FJBDAGLK|ABDFHIJK:HJBDAFIK|ABDFHIJL:HJBDAFLI|ABDFHIKL:HIBDAFLK|ABDFHJKL:HJBDAFLK|ABDFIJKL:IJBDAFLK|ABDGHIJK:HJBDAGIK|ABDGHIJL:HJBDAGLI|ABDGHIKL:IGBDAHLK|ABDGHJKL:HJBDAGLK|ABDGIJKL:IJBDAGLK|ABDHIJKL:IJBDAHLK|ABEFGHIJ:HJBFAGEI|ABEFGHIK:EGBFAHIK|ABEFGHIL:EGBFAHLI|ABEFGHJK:HJBFAGEK|ABEFGHJL:HJBFAGLE|ABEFGHKL:EGBFAHLK|ABEFGIJK:EJBFAGIK|ABEFGIJL:EJBFAGLI|ABEFGIKL:EGBAIFLK|ABEFGJKL:EJBFAGLK|ABEFHIJK:EJBFAHIK|ABEFHIJL:EJBFAHLI|ABEFHIKL:EIBFAHLK|ABEFHJKL:EJBFAHLK|ABEFIJKL:EJBAIFLK|ABEGHIJK:EJBAHGIK|ABEGHIJL:EJBAHGLI|ABEGHIKL:EGBAIHLK|ABEGHJKL:EJBAHGLK|ABEGIJKL:EJBAIGLK|ABEHIJKL:EJBAIHLK|ABFGHIJK:HJBFAGIK|ABFGHIJL:HJBFAGLI|ABFGHIKL:HGBAIFLK|ABFGHJKL:HJBFAGLK|ABFGIJKL:IJBFAGLK|ABFHIJKL:HJBAIFLK|ABGHIJKL:HJBAIGLK|ACDEFGHI:HGECAFDI|ACDEFGHJ:HGJCAFDE|ACDEFGHK:HGECAFDK|ACDEFGHL:HGFCADLE|ACDEFGIJ:CGJDAFEI|ACDEFGIK:CGEDAFIK|ACDEFGIL:CGEDAFLI|ACDEFGJK:CGJDAFEK|ACDEFGJL:CGJDAFLE|ACDEFGKL:CGEDAFLK|ACDEFHIJ:HJECAFDI|ACDEFHIK:HEFCADIK|ACDEFHIL:HEFCADLI|ACDEFHJK:HJECAFDK|ACDEFHJL:HJFCADLE|ACDEFHKL:HEFCADLK|ACDEFIJK:CJEDAFIK|ACDEFIJL:CJEDAFLI|ACDEFIKL:CEIDAFLK|ACDEFJKL:CJEDAFLK|ACDEGHIJ:HGJCADEI|ACDEGHIK:HGECADIK|ACDEGHIL:HGECADLI|ACDEGHJK:HGJCADEK|ACDEGHJL:HGJCADLE|ACDEGHKL:HGECADLK|ACDEGIJK:EGJCADIK|ACDEGIJL:EGJCADLI|ACDEGIKL:EGICADLK|ACDEGJKL:EGJCADLK|ACDEHIJK:HJECADIK|ACDEHIJL:HJECADLI|ACDEHIKL:HEICADLK|ACDEHJKL:HJECADLK|ACDEIJKL:EJICADLK|ACDFGHIJ:HGJCAFDI|ACDFGHIK:HGFCADIK|ACDFGHIL:HGFCADLI|ACDFGHJK:HGJCAFDK|ACDFGHJL:CGJDAFLH|ACDFGHKL:HGFCADLK|ACDFGIJK:CGJDAFIK|ACDFGIJL:CGJDAFLI|ACDFGIKL:CGIDAFLK|ACDFGJKL:CGJDAFLK|ACDFHIJK:HJFCADIK|ACDFHIJL:HJFCADLI|ACDFHIKL:HFICADLK|ACDFHJKL:HJFCADLK|ACDFIJKL:CJIDAFLK|ACDGHIJK:HGJCADIK|ACDGHIJL:HGJCADLI|ACDGHIKL:HGICADLK|ACDGHJKL:HGJCADLK|ACDGIJKL:IGJCADLK|ACDHIJKL:HJICADLK|ACEFGHIJ:HGJCAFEI|ACEFGHIK:HGECAFIK|ACEFGHIL:HGECAFLI|ACEFGHJK:HGJCAFEK|ACEFGHJL:HGJCAFLE|ACEFGHKL:HGECAFLK|ACEFGIJK:EGJCAFIK|ACEFGIJL:EGJCAFLI|ACEFGIKL:EGICAFLK|ACEFGJKL:EGJCAFLK|ACEFHIJK:HJECAFIK|ACEFHIJL:HJECAFLI|ACEFHIKL:HEICAFLK|ACEFHJKL:HJECAFLK|ACEFIJKL:EJICAFLK|ACEGHIJK:EGJCAHIK|ACEGHIJL:EGJCAHLI|ACEGHIKL:EGICAHLK|ACEGHJKL:EGJCAHLK|ACEGIJKL:EJICAGLK|ACEHIJKL:EJICAHLK|ACFGHIJK:HGJCAFIK|ACFGHIJL:HGJCAFLI|ACFGHIKL:HGICAFLK|ACFGHJKL:HGJCAFLK|ACFGIJKL:IGJCAFLK|ACFHIJKL:HJICAFLK|ACGHIJKL:HJICAGLK|ADEFGHIJ:HGJDAFEI|ADEFGHIK:HGEDAFIK|ADEFGHIL:HGEDAFLI|ADEFGHJK:HGJDAFEK|ADEFGHJL:HGJDAFLE|ADEFGHKL:HGEDAFLK|ADEFGIJK:EGJDAFIK|ADEFGIJL:EGJDAFLI|ADEFGIKL:EGIDAFLK|ADEFGJKL:EGJDAFLK|ADEFHIJK:HJEDAFIK|ADEFHIJL:HJEDAFLI|ADEFHIKL:HEIDAFLK|ADEFHJKL:HJEDAFLK|ADEFIJKL:EJIDAFLK|ADEGHIJK:EGJDAHIK|ADEGHIJL:EGJDAHLI|ADEGHIKL:EGIDAHLK|ADEGHJKL:EGJDAHLK|ADEGIJKL:EJIDAGLK|ADEHIJKL:EJIDAHLK|ADFGHIJK:HGJDAFIK|ADFGHIJL:HGJDAFLI|ADFGHIKL:HGIDAFLK|ADFGHJKL:HGJDAFLK|ADFGIJKL:IGJDAFLK|ADFHIJKL:HJIDAFLK|ADGHIJKL:HJIDAGLK|AEFGHIJK:EGJFAHIK|AEFGHIJL:EGJFAHLI|AEFGHIKL:EGIFAHLK|AEFGHJKL:EGJFAHLK|AEFGIJKL:EJIFAGLK|AEFHIJKL:EJIFAHLK|AEGHIJKL:EJIAHGLK|AFGHIJKL:HJIFAGLK|BCDEFGHI:CGBDHFEI|BCDEFGHJ:HGBCJFDE|BCDEFGHK:CGBDHFEK|BCDEFGHL:CGBDHFLE|BCDEFGIJ:CGBDJFEI|BCDEFGIK:CGBDEFIK|BCDEFGIL:CGBDEFLI|BCDEFGJK:CGBDJFEK|BCDEFGJL:CGBDJFLE|BCDEFGKL:CGBDEFLK|BCDEFHIJ:CJBDHFEI|BCDEFHIK:CEBDHFIK|BCDEFHIL:CEBDHFLI|BCDEFHJK:CJBDHFEK|BCDEFHJL:CJBDHFLE|BCDEFHKL:CEBDHFLK|BCDEFIJK:CJBDEFIK|BCDEFIJL:CJBDEFLI|BCDEFIKL:CEBDIFLK|BCDEFJKL:CJBDEFLK|BCDEGHIJ:HGBCJDEI|BCDEGHIK:EGBCHDIK|BCDEGHIL:EGBCHDLI|BCDEGHJK:HGBCJDEK|BCDEGHJL:HGBCJDLE|BCDEGHKL:EGBCHDLK|BCDEGIJK:EGBCJDIK|BCDEGIJL:EGBCJDLI|BCDEGIKL:EGBCIDLK|BCDEGJKL:EGBCJDLK|BCDEHIJK:EJBCHDIK|BCDEHIJL:EJBCHDLI|BCDEHIKL:EIBCHDLK|BCDEHJKL:EJBCHDLK|BCDEIJKL:EJBCIDLK|BCDFGHIJ:HGBCJFDI|BCDFGHIK:CGBDHFIK|BCDFGHIL:CGBDHFLI|BCDFGHJK:HGBCJFDK|BCDFGHJL:CGBDHFLJ|BCDFGHKL:CGBDHFLK|BCDFGIJK:CGBDJFIK|BCDFGIJL:CGBDJFLI|BCDFGIKL:CGBDIFLK|BCDFGJKL:CGBDJFLK|BCDFHIJK:CJBDHFIK|BCDFHIJL:CJBDHFLI|BCDFHIKL:CIBDHFLK|BCDFHJKL:CJBDHFLK|BCDFIJKL:CJBDIFLK|BCDGHIJK:HGBCJDIK|BCDGHIJL:HGBCJDLI|BCDGHIKL:HGBCIDLK|BCDGHJKL:HGBCJDLK|BCDGIJKL:IGBCJDLK|BCDHIJKL:HJBCIDLK|BCEFGHIJ:HGBCJFEI|BCEFGHIK:EGBCHFIK|BCEFGHIL:EGBCHFLI|BCEFGHJK:HGBCJFEK|BCEFGHJL:HGBCJFLE|BCEFGHKL:EGBCHFLK|BCEFGIJK:EGBCJFIK|BCEFGIJL:EGBCJFLI|BCEFGIKL:EGBCIFLK|BCEFGJKL:EGBCJFLK|BCEFHIJK:EJBCHFIK|BCEFHIJL:EJBCHFLI|BCEFHIKL:EIBCHFLK|BCEFHJKL:EJBCHFLK|BCEFIJKL:EJBCIFLK|BCEGHIJK:EJBCHGIK|BCEGHIJL:EJBCHGLI|BCEGHIKL:EGBCIHLK|BCEGHJKL:EJBCHGLK|BCEGIJKL:EJBCIGLK|BCEHIJKL:EJBCIHLK|BCFGHIJK:HGBCJFIK|BCFGHIJL:HGBCJFLI|BCFGHIKL:HGBCIFLK|BCFGHJKL:HGBCJFLK|BCFGIJKL:IGBCJFLK|BCFHIJKL:HJBCIFLK|BCGHIJKL:HJBCIGLK|BDEFGHIJ:HGBDJFEI|BDEFGHIK:EGBDHFIK|BDEFGHIL:EGBDHFLI|BDEFGHJK:HGBDJFEK|BDEFGHJL:HGBDJFLE|BDEFGHKL:EGBDHFLK|BDEFGIJK:EGBDJFIK|BDEFGIJL:EGBDJFLI|BDEFGIKL:EGBDIFLK|BDEFGJKL:EGBDJFLK|BDEFHIJK:EJBDHFIK|BDEFHIJL:EJBDHFLI|BDEFHIKL:EIBDHFLK|BDEFHJKL:EJBDHFLK|BDEFIJKL:EJBDIFLK|BDEGHIJK:EJBDHGIK|BDEGHIJL:EJBDHGLI|BDEGHIKL:EGBDIHLK|BDEGHJKL:EJBDHGLK|BDEGIJKL:EJBDIGLK|BDEHIJKL:EJBDIHLK|BDFGHIJK:HGBDJFIK|BDFGHIJL:HGBDJFLI|BDFGHIKL:HGBDIFLK|BDFGHJKL:HGBDJFLK|BDFGIJKL:IGBDJFLK|BDFHIJKL:HJBDIFLK|BDGHIJKL:HJBDIGLK|BEFGHIJK:EJBFHGIK|BEFGHIJL:EJBFHGLI|BEFGHIKL:EGBFIHLK|BEFGHJKL:EJBFHGLK|BEFGIJKL:EJBFIGLK|BEFHIJKL:EJBFIHLK|BEGHIJKL:EJIBHGLK|BFGHIJKL:HJBFIGLK|CDEFGHIJ:CGJDHFEI|CDEFGHIK:CGEDHFIK|CDEFGHIL:CGEDHFLI|CDEFGHJK:CGJDHFEK|CDEFGHJL:CGJDHFLE|CDEFGHKL:CGEDHFLK|CDEFGIJK:CGEDJFIK|CDEFGIJL:CGEDJFLI|CDEFGIKL:CGEDIFLK|CDEFGJKL:CGEDJFLK|CDEFHIJK:CJEDHFIK|CDEFHIJL:CJEDHFLI|CDEFHIKL:CEIDHFLK|CDEFHJKL:CJEDHFLK|CDEFIJKL:CJEDIFLK|CDEGHIJK:EGJCHDIK|CDEGHIJL:EGJCHDLI|CDEGHIKL:EGICHDLK|CDEGHJKL:EGJCHDLK|CDEGIJKL:EGICJDLK|CDEHIJKL:EJICHDLK|CDFGHIJK:CGJDHFIK|CDFGHIJL:CGJDHFLI|CDFGHIKL:CGIDHFLK|CDFGHJKL:CGJDHFLK|CDFGIJKL:CGIDJFLK|CDFHIJKL:CJIDHFLK|CDGHIJKL:HGICJDLK|CEFGHIJK:EGJCHFIK|CEFGHIJL:EGJCHFLI|CEFGHIKL:EGICHFLK|CEFGHJKL:EGJCHFLK|CEFGIJKL:EGICJFLK|CEFHIJKL:EJICHFLK|CEGHIJKL:EJICHGLK|CFGHIJKL:HGICJFLK|DEFGHIJK:EGJDHFIK|DEFGHIJL:EGJDHFLI|DEFGHIKL:EGIDHFLK|DEFGHJKL:EGJDHFLK|DEFGIJKL:EGIDJFLK|DEFHIJKL:EJIDHFLK|DEGHIJKL:EJIDHGLK|DFGHIJKL:HGIDJFLK|EFGHIJKL:EJIFHGLK';
const AC={};AC_RAW.split('|').forEach(e=>{const[k,v]=e.split(':');AC[k]=v;});

function solve3rd(qG) {
  const key = qG.slice().sort().join('');
  const val = AC[key];
  const r = {};
  W3.forEach((w, i) => { r[w] = val[i]; });
  return r;
}

const GS = [
  ['A',0,1,'11/Jun','Cidade do México'],['A',2,3,'11/Jun','Guadalajara'],
  ['B',0,1,'12/Jun','Toronto'],['D',0,1,'12/Jun','Los Angeles'],
  ['D',2,3,'14/Jun','Vancouver'],['B',2,3,'13/Jun','São Francisco'],['C',0,1,'13/Jun','Nova York/NJ'],['C',2,3,'13/Jun','Boston'],
  ['E',0,1,'14/Jun','Houston'],['F',0,1,'14/Jun','Dallas'],['E',2,3,'14/Jun','Filadélfia'],['F',2,3,'14/Jun','Monterrey'],
  ['H',0,1,'15/Jun','Atlanta'],['G',0,1,'15/Jun','Seattle'],['H',2,3,'15/Jun','Miami'],['G',2,3,'15/Jun','Los Angeles'],
  ['J',0,1,'16/Jun','Kansas City'],['I',0,1,'16/Jun','Nova York/NJ'],['I',2,3,'16/Jun','Boston'],
  ['J',2,3,'17/Jun','São Francisco'],['K',0,1,'17/Jun','Houston'],['L',0,1,'17/Jun','Dallas'],['L',2,3,'17/Jun','Toronto'],['K',2,3,'17/Jun','Cidade do México'],
  ['A',3,1,'18/Jun','Atlanta'],['B',3,1,'18/Jun','Los Angeles'],['B',0,2,'18/Jun','Vancouver'],['A',0,2,'18/Jun','Guadalajara'],
  ['D',3,1,'20/Jun','São Francisco'],['D',0,2,'19/Jun','Seattle'],['C',3,1,'19/Jun','Boston'],['C',0,2,'19/Jun','Filadélfia'],
  ['F',0,2,'20/Jun','Houston'],['E',0,2,'20/Jun','Toronto'],['E',3,1,'20/Jun','Kansas City'],
  ['F',3,1,'20/Jun','Monterrey'],['H',0,2,'21/Jun','Atlanta'],['G',0,2,'21/Jun','Los Angeles'],['H',3,1,'21/Jun','Miami'],['G',3,1,'21/Jun','Vancouver'],
  ['J',0,2,'22/Jun','Dallas'],['I',0,2,'22/Jun','Filadélfia'],['I',3,1,'22/Jun','Nova York/NJ'],
  ['J',3,1,'23/Jun','São Francisco'],['K',0,2,'23/Jun','Houston'],['L',0,2,'23/Jun','Boston'],['L',3,1,'23/Jun','Toronto'],['K',3,1,'23/Jun','Guadalajara'],
  ['B',3,0,'24/Jun','Vancouver'],['B',1,2,'24/Jun','Seattle'],['C',3,0,'24/Jun','Miami'],['C',1,2,'24/Jun','Atlanta'],['A',3,0,'24/Jun','Cidade do México'],['A',1,2,'24/Jun','Monterrey'],
  ['E',1,2,'25/Jun','Filadélfia'],['E',3,0,'25/Jun','Nova York/NJ'],['F',1,2,'25/Jun','Dallas'],['F',3,0,'25/Jun','Kansas City'],['D',3,0,'25/Jun','Los Angeles'],['D',1,2,'25/Jun','São Francisco'],
  ['I',3,0,'26/Jun','Boston'],['I',1,2,'26/Jun','Toronto'],['H',1,2,'26/Jun','Houston'],['H',3,0,'26/Jun','Guadalajara'],
  ['G',3,0,'27/Jun','Vancouver'],['G',1,2,'27/Jun','Seattle'],['L',3,0,'27/Jun','Nova York/NJ'],['L',1,2,'27/Jun','Filadélfia'],['K',3,0,'27/Jun','Miami'],['K',1,2,'27/Jun','Atlanta'],['J',3,0,'27/Jun','Dallas'],['J',1,2,'27/Jun','Kansas City']
];

let _ME = 1.32;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📌 RESULTADOS OFICIAIS JÁ JOGADOS — atualizar manualmente conforme a Copa avança.
// Fase de grupos: a chave é o número do jogo (M1=1, M2=2, ..., M72=72).
// Mata-mata:      a chave é 'k' + número do jogo (ex: 'k73' para o jogo 73).
// Aceita opcional `pw` ('A' ou 'B') para vencedor nos pênaltis em caso de empate.
// Exemplo: 1: {gA: 1, gB: 0},  // México 1-0 África do Sul
// Exemplo: 'k73': {gA: 1, gB: 1, pw: 'B'},  // empate em 90', visitante venceu nos pênaltis
const BUILT_IN_RESULTS = {
  // (preencher aqui conforme a Copa começar)
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let _hb = 70; // vantagem de mando (Elo) para anfitriãs jogando no próprio país — ajustável via slider
const CITY_COUNTRY = {'Los Angeles':'USA','São Francisco':'USA','Seattle':'USA','Dallas':'USA','Houston':'USA','Kansas City':'USA','Atlanta':'USA','Miami':'USA','Nova York/NJ':'USA','Boston':'USA','Filadélfia':'USA','MetLife':'USA','Cidade do México':'Mexico','Guadalajara':'Mexico','Monterrey':'Mexico','Toronto':'Canada','Vancouver':'Canada'};
const isHome = (team, city) => { const c = CITY_COUNTRY[city]; return (team === 'USA' && c === 'USA') || (team === 'Mexico' && c === 'Mexico') || (team === 'Canada' && c === 'Canada'); };
const nm = t => PT[t] || t;
const fl = t => FL[t] || '🏳️';
const DOW = d => { const [day, mon] = d.split('/'); const m = { Jun: 5, Jul: 6 }; const dt = new Date(2026, m[mon], +day); return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dt.getDay()]; };
// Chave cronológica de uma data "DD/Mon" (Jun/Jul) para ordenar seções por dia.
const dateKey = d => { const [day, mon] = d.split('/'); return ({ Jun: 6, Jul: 7 }[mon] || 0) * 100 + (+day || 0); };
// BRT offset by city (hours ahead of local to get BRT; BRT = UTC-3)
const TZ = {'Cidade do México':0,'Guadalajara':0,'Monterrey':0,'Toronto':-1,'Vancouver':-2,'Los Angeles':-2,'São Francisco':-2,'Seattle':-2,'Dallas':0,'Houston':0,'Kansas City':0,'Atlanta':-1,'Miami':-1,'Nova York/NJ':-1,'Boston':-1,'Filadélfia':-1,'MetLife':-1};
// BRT kickoff times (FIFA oficial, ordem por match number) — fase de grupos (1-72) e mata-mata (73-104)
const GS_BRT = ['16:00','23:00','16:00','22:00','01:00','16:00','19:00','22:00','14:00','17:00','20:00','23:00','13:00','16:00','19:00','22:00','22:00','16:00','19:00','01:00','14:00','17:00','20:00','21:00','13:00','16:00','19:00','22:00','00:00','16:00','19:00','21:30','14:00','17:00','21:00','23:00','13:00','16:00','19:00','22:00','14:00','18:00','21:00','00:00','14:00','17:00','20:00','23:00','16:00','16:00','19:00','19:00','22:00','22:00','17:00','17:00','20:00','20:00','23:00','23:00','16:00','16:00','21:00','21:00','00:00','00:00','18:00','18:00','20:30','20:30','23:00','23:00'];
const KO_BRT = {73:'16:00',74:'17:30',75:'22:00',76:'14:00',77:'18:00',78:'14:00',79:'22:00',80:'13:00',81:'21:00',82:'17:00',83:'20:00',84:'16:00',85:'00:00',86:'19:00',87:'22:30',88:'15:00',89:'18:00',90:'14:00',91:'17:00',92:'21:00',93:'16:00',94:'21:00',95:'13:00',96:'17:00',97:'17:00',98:'16:00',99:'18:00',100:'22:00',101:'16:00',102:'16:00',103:'18:00',104:'16:00'};
const KO_DATE = {73:'28/Jun',74:'29/Jun',75:'29/Jun',76:'29/Jun',77:'30/Jun',78:'30/Jun',79:'30/Jun',80:'1/Jul',81:'1/Jul',82:'1/Jul',83:'2/Jul',84:'2/Jul',85:'3/Jul',86:'3/Jul',87:'3/Jul',88:'3/Jul',89:'4/Jul',90:'4/Jul',91:'5/Jul',92:'5/Jul',93:'6/Jul',94:'6/Jul',95:'7/Jul',96:'7/Jul',97:'9/Jul',98:'10/Jul',99:'11/Jul',100:'11/Jul',101:'14/Jul',102:'15/Jul',103:'18/Jul',104:'19/Jul'};
const KO_CITY = {73:'Los Angeles',74:'Boston',75:'Monterrey',76:'Houston',77:'Nova York/NJ',78:'Dallas',79:'Cd. México',80:'Atlanta',81:'S. Francisco',82:'Seattle',83:'Toronto',84:'Los Angeles',85:'Vancouver',86:'Miami',87:'Kansas City',88:'Dallas',89:'Filadélfia',90:'Houston',91:'Nova York/NJ',92:'Cd. México',93:'Dallas',94:'Seattle',95:'Atlanta',96:'Vancouver',97:'Boston',98:'Los Angeles',99:'Miami',100:'Kansas City',101:'Dallas',102:'Atlanta',103:'Miami',104:'MetLife'};
// Ordem visual do chaveamento (pathways do Bracket): índices nos arrays r32/r16 do runSim.
// Usada para o "1 Copa" listar os confrontos na MESMA sequência da aba Probs/Bracket.
const BRACKET_R32_ORDER = [1, 4, 0, 2, 10, 11, 8, 9, 3, 5, 6, 7, 13, 15, 12, 14];
const BRACKET_R16_ORDER = [0, 1, 4, 5, 2, 3, 6, 7];
// Mata-mata spec: como cada partida resolve seus 2 times. type: 'pos' (1°/2° de grupo), '3rd' (Anexo C), 'win' (vencedor jogo X), 'lose' (perdedor jogo X = só M103)
const KO_SPEC = {
  73:{h:{t:'pos',g:'A',p:2},a:{t:'pos',g:'B',p:2},l:'2A×2B',ph:'R32'},
  74:{h:{t:'pos',g:'E',p:1},a:{t:'3rd',s:'E'},l:'1E×3°',ph:'R32'},
  75:{h:{t:'pos',g:'F',p:1},a:{t:'pos',g:'C',p:2},l:'1F×2C',ph:'R32'},
  76:{h:{t:'pos',g:'C',p:1},a:{t:'pos',g:'F',p:2},l:'1C×2F',ph:'R32'},
  77:{h:{t:'pos',g:'I',p:1},a:{t:'3rd',s:'I'},l:'1I×3°',ph:'R32'},
  78:{h:{t:'pos',g:'E',p:2},a:{t:'pos',g:'I',p:2},l:'2E×2I',ph:'R32'},
  79:{h:{t:'pos',g:'A',p:1},a:{t:'3rd',s:'A'},l:'1A×3°',ph:'R32'},
  80:{h:{t:'pos',g:'L',p:1},a:{t:'3rd',s:'L'},l:'1L×3°',ph:'R32'},
  81:{h:{t:'pos',g:'D',p:1},a:{t:'3rd',s:'D'},l:'1D×3°',ph:'R32'},
  82:{h:{t:'pos',g:'G',p:1},a:{t:'3rd',s:'G'},l:'1G×3°',ph:'R32'},
  83:{h:{t:'pos',g:'K',p:2},a:{t:'pos',g:'L',p:2},l:'2K×2L',ph:'R32'},
  84:{h:{t:'pos',g:'H',p:1},a:{t:'pos',g:'J',p:2},l:'1H×2J',ph:'R32'},
  85:{h:{t:'pos',g:'B',p:1},a:{t:'3rd',s:'B'},l:'1B×3°',ph:'R32'},
  86:{h:{t:'pos',g:'J',p:1},a:{t:'pos',g:'H',p:2},l:'1J×2H',ph:'R32'},
  87:{h:{t:'pos',g:'K',p:1},a:{t:'3rd',s:'K'},l:'1K×3°',ph:'R32'},
  88:{h:{t:'pos',g:'D',p:2},a:{t:'pos',g:'G',p:2},l:'2D×2G',ph:'R32'},
  89:{h:{t:'win',m:74},a:{t:'win',m:77},l:'W74×W77',ph:'R16'},
  90:{h:{t:'win',m:73},a:{t:'win',m:75},l:'W73×W75',ph:'R16'},
  91:{h:{t:'win',m:76},a:{t:'win',m:78},l:'W76×W78',ph:'R16'},
  92:{h:{t:'win',m:79},a:{t:'win',m:80},l:'W79×W80',ph:'R16'},
  93:{h:{t:'win',m:83},a:{t:'win',m:84},l:'W83×W84',ph:'R16'},
  94:{h:{t:'win',m:81},a:{t:'win',m:82},l:'W81×W82',ph:'R16'},
  95:{h:{t:'win',m:86},a:{t:'win',m:88},l:'W86×W88',ph:'R16'},
  96:{h:{t:'win',m:85},a:{t:'win',m:87},l:'W85×W87',ph:'R16'},
  97:{h:{t:'win',m:89},a:{t:'win',m:90},l:'W89×W90',ph:'QF'},
  98:{h:{t:'win',m:93},a:{t:'win',m:94},l:'W93×W94',ph:'QF'},
  99:{h:{t:'win',m:91},a:{t:'win',m:92},l:'W91×W92',ph:'QF'},
 100:{h:{t:'win',m:95},a:{t:'win',m:96},l:'W95×W96',ph:'QF'},
 101:{h:{t:'win',m:97},a:{t:'win',m:98},l:'W97×W98',ph:'SF'},
 102:{h:{t:'win',m:99},a:{t:'win',m:100},l:'W99×W100',ph:'SF'},
 103:{h:{t:'lose',m:101},a:{t:'lose',m:102},l:'3° lugar',ph:'3°'},
 104:{h:{t:'win',m:101},a:{t:'win',m:102},l:'FINAL',ph:'FIN'},
};

// Engine
let _rSys = 'fifa';
let _customElo = {};
let _useTilt = false; // global toggle: aplica tilt ao total de gols esperados
let _fav = 1; // peso do favoritismo: 0 = modelo antigo (c0=0.55 fixo), 1 = recalibrado (c0 cai em desníveis grandes)
let _spread = true; // tilt de goleada: total de gols sobe em desníveis grandes de Elo (favorito goleia), como nos dados reais
let _inj = {}; // (não usado — lesões agora são por jogo via _injM)
let _injM = {}; // lesões por jogo de grupo: _injM[idxGS] = { h: nº lesões mandante, a: nº lesões visitante }
let _dynAdj = {}; // ajuste dinâmico de Elo a partir dos resultados já disputados (camada opcional; vazio = desligado)
const INJ_ELO = 18; // queda de Elo por lesão de titular importante (~15-20 é uma boa representação)
const rtRaw = t => _rSys === 'custom' ? (_customElo[t] || ELO[t] || 1400) : _rSys === 'elo' ? (ELO[t] || 1400) : _rSys === 'bet' ? (BET[t] || 1400) : _rSys === 'pele' ? (PELE[t] || ELO[t] || 1400) : (FP[t] || 1400);
const rtBase = t => rtRaw(t) + (_dynAdj[t] || 0); // rating efetivo = base + ajuste dinâmico (0 quando desligado)
const tiltOf = t => (_useTilt && TILT[t] != null) ? TILT[t] : 0;
const matchTilt = (tA, tB) => tiltOf(tA) + tiltOf(tB); // soma dos dois times = shift no total de gols

const pp = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
// erf (Abramowitz-Stegun 7.1.26) e CDF normal — usados no teste de hipótese de gols/jogo.
const erf = x => { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
const normCdf = z => 0.5 * (1 + erf(z / Math.SQRT2));
// cL agora aceita tilt (soma dos 2 times) — desloca o total de gols esperados aditivamente
// Total de gols esperados = la+lb ≈ 2*_ME. Adicionamos tilt diretamente no total → shift _ME por tilt/2.
const cL = (a, b, tilt = 0) => {
  const d = a - b;
  const e = 1 / (1 + Math.pow(10, -d / 400));
  // Total de gols: tilt de ESTILO (aditivo, soma dos times) × tilt de GOLEADA (multiplicativo, função do desnível).
  const meBase = Math.max(0.45, Math.min(2.4, _ME + tilt * 0.5));
  const g = _spread ? (0.90 + 0.45 / (1 + Math.exp(-(Math.abs(d) - 330) / 80))) : 1; // ~0.91 (equilibrado) → ~1.35 (grande desnível)
  const me = meBase * g;
  // Divisão favorito/azarão: _fav interpola entre modelo antigo (c0=0.55 fixo) e calibrado.
  const sig = 1 / (1 + Math.exp(-(Math.abs(d) - 190) / 70));
  const c0 = 0.55 * (1 - _fav) + _fav * (0.50 - 0.40 * sig);
  const c1 = 2 * (1 - c0);
  return { la: Math.max(.25, Math.min(3.8, me * (c0 + c1 * e))), lb: Math.max(.25, Math.min(3.8, me * (c0 + c1 * (1 - e)))) };
};
// PRNG determinístico (mulberry32) p/ Common Random Numbers no impacto leave-one-out.
const mulberry32 = (a) => () => {
  a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Substream por (semente da simulação, chave do jogo/decisão). Alinhamento POR CHAVE:
// o jogo X consome os mesmos números nas duas sims do par, independente de quantos
// randoms os outros jogos gastaram. Chaves: jogo de grupo = idx 0-71; KO = mn 73-104;
// desempate do grupo = 200+(gn-65); sort dos 12 terceiros = 240.
const makeRnd = (seed, key) => mulberry32((Math.imul(seed ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(key + 1, 0xC2B2AE35)) >>> 0);
const sP = (l, rnd = Math.random) => { let r = rnd(), a = 0; for (let g = 0; g <= 7; g++) { a += pp(l, g); if (r < a) return g; } return 7; };
const sM = (a, b, tA = '', tB = '', rnd = Math.random) => { const { la, lb } = cL(a, b, matchTilt(tA, tB)); return { gA: sP(la, rnd), gB: sP(lb, rnd) }; };
const sKO = (a, b, tA = '', tB = '', rnd = Math.random) => {
  const mt = matchTilt(tA, tB);
  let { gA, gB } = sM(a, b, tA, tB, rnd); let aet = false, pen = false;
  if (gA === gB) { aet = true; const { la, lb } = cL(a, b, mt); gA += sP(la * .33, rnd); gB += sP(lb * .33, rnd); }
  if (gA === gB) { pen = true; const penW = rnd() < .5 + (a - b) / 4000 ? 'A' : 'B'; return { w: penW, gA, gB, aet, pen }; }
  return { w: gA > gB ? 'A' : 'B', gA, gB, aet, pen };
};
const ef = t => rtBase(t);
const efCity = (t, city) => rtBase(t) + (isHome(t, city) ? _hb : 0);
const rt = t => rtBase(t);
const rG = pc => { const g = {}; for (const [n, t] of Object.entries(GT)) g[n] = t.map(s => PO[s] ? PO[s].t[pc[s] || 0] : s); return g; };
const mProbs = (a, b, tA = '', tB = '') => { const { la, lb } = cL(a, b, matchTilt(tA, tB)); let pH = 0, pD = 0, pA = 0; for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const p = pp(la, i) * pp(lb, j); if (i > j) pH += p; else if (i === j) pD += p; else pA += p; } const t = pH + pD + pA; return { pH: pH / t * 100, pD: pD / t * 100, pA: pA / t * 100 }; };
// Placar mais provável (moda) e sua probabilidade
const modeScore = (a, b, tA = '', tB = '') => { const { la, lb } = cL(a, b, matchTilt(tA, tB)); let best = -1, bi = 0, bj = 0; for (let i = 0; i <= 9; i++) for (let j = 0; j <= 9; j++) { const p = pp(la, i) * pp(lb, j); if (p > best) { best = p; bi = i; bj = j; } } return { a: bi, b: bj, pct: best * 100 }; };
// Mediana a partir de um histograma {valor: contagem}
const medianFromHist = (h, total) => { const keys = Object.keys(h).map(Number).sort((x, y) => x - y); let cum = 0; const half = total / 2; for (const k of keys) { cum += h[k]; if (cum >= half) return k; } return keys.length ? keys[keys.length - 1] : 0; };
// Moda (valor mais frequente) de um histograma {valor: contagem}
const modeFromHist = (h) => { let best = -1, bk = 0; for (const k of Object.keys(h)) { if (h[k] > best) { best = h[k]; bk = +k; } } return bk; };
// Registro conjunto (V,E) → pontos e V/E/D consistentes entre si. Chave 'w_d', E e D são empates/derrotas.
const wdMode = (h) => { let best = -1, bw = 0, bd = 0; for (const k of Object.keys(h)) { if (h[k] > best) { best = h[k]; const [w, d] = k.split('_').map(Number); bw = w; bd = d; } } return { w: bw, d: bd, pts: 3 * bw + bd }; };
const wdMedian = (h, total) => { const recs = Object.keys(h).map(k => { const [w, d] = k.split('_').map(Number); return { w, d, pts: 3 * w + d, c: h[k] }; }).sort((a, b) => a.pts - b.pts || b.c - a.c); let cum = 0; const half = total / 2; for (const r of recs) { cum += r.c; if (cum >= half) return r; } return recs.length ? recs[recs.length - 1] : { w: 0, d: 0, pts: 0 }; };
// Mediana e moda de uma Poisson(l)
const medPois = (l) => { let cum = 0; for (let k = 0; k <= 15; k++) { cum += pp(l, k); if (cum >= 0.5) return k; } return 15; };
// Disputa de pênaltis (melhor-de-5 + morte súbita), determinística (LCG com semente fixa).
// Retorna { winA, sc } onde sc[`ma-mb`] = frequência do placar final de gols convertidos.
const penShootout = (pA, pB) => {
  let s = 0x9e3779b9 >>> 0; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const N = 40000, sc = {}; let winA = 0;
  const dec = (ma, mb, ra, rb) => ma > mb + rb || mb > ma + ra;
  for (let n = 0; n < N; n++) {
    let ma = 0, mb = 0, ka = 0, kb = 0, done = false;
    for (let r = 0; r < 5 && !done; r++) {
      if (rnd() < pA) ma++; ka++; if (dec(ma, mb, 5 - ka, 5 - kb)) { done = true; break; }
      if (rnd() < pB) mb++; kb++; if (dec(ma, mb, 5 - ka, 5 - kb)) { done = true; break; }
    }
    if (ma === mb) { for (let r = 0; r < 30; r++) { const x = rnd() < pA ? 1 : 0, y = rnd() < pB ? 1 : 0; ma += x; mb += y; if (x !== y) break; } }
    if (ma > mb) winA++; const k = ma + '-' + mb; sc[k] = (sc[k] || 0) + 1;
  }
  return { winA: winA / N, sc };
};
const modePois = (l) => { let best = -1, bk = 0; for (let k = 0; k <= 15; k++) { const p = pp(l, k); if (p > best) { best = p; bk = k; } } return bk; };
// Placar de referência por estatística: 'mode' (mais provável), 'median' (50º percentil pela margem), 'mean' (gols esperados, fracionário)
const scoreStat = (a, b, tA, tB, kind) => {
  const { la, lb } = cL(a, b, matchTilt(tA, tB));
  if (kind === 'mean') return { a: la, b: lb, pct: null, frac: true };
  if (kind === 'mode') { const ia = modePois(la), ib = modePois(lb); return { a: ia, b: ib, pct: pp(la, ia) * pp(lb, ib) * 100, frac: false }; }
  // median: ordena os resultados pela margem (mandante − visitante) e pega o 50º percentil.
  const N = 12; const margP = {};
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const m = i - j; margP[m] = (margP[m] || 0) + pp(la, i) * pp(lb, j); }
  const margins = Object.keys(margP).map(Number).sort((x, y) => x - y);
  let cum = 0, mStar = margins[0];
  for (const m of margins) { cum += margP[m]; if (cum >= 0.5) { mStar = m; break; } }
  // placar representativo: o mais provável com essa margem mediana
  let best = -1, bi = 0, bj = 0;
  for (let i = 0; i <= N; i++) { const j = i - mStar; if (j < 0 || j > N) continue; const p = pp(la, i) * pp(lb, j); if (p > best) { best = p; bi = i; bj = j; } }
  return { a: bi, b: bj, pct: (margP[mStar] || 0) * 100, frac: false, margin: mStar };
};

// Surpresa de um resultado já conhecido: P(placar exato) e P(desfecho 1X2) pré-jogo.
// bits = -log2(p) — quanto maior, mais surpreendente.
const surpriseOf = (eH, eA, tA, tB, gA, gB) => {
  const { la, lb } = cL(eH, eA, matchTilt(tA, tB));
  const pExact = pp(la, gA) * pp(lb, gB);
  const pr = mProbs(eH, eA, tA, tB);
  const pOut = (gA > gB ? pr.pH : gA < gB ? pr.pA : pr.pD) / 100;
  return { pExact, pOut, bitsExact: -Math.log2(Math.max(pExact, 1e-12)), bitsOut: -Math.log2(Math.max(pOut, 1e-12)) };
};

// ── Modelo ao vivo ────────────────────────────────────────────────────────────
// Intensidade de gols cresce ao longo do jogo: w(t) = a + b·t no tempo regulamentar,
// calibrada para LIVE_F2 dos gols caírem no 2º tempo. Acréscimos jogam com a
// intensidade do FIM do tempo correspondente (w(45) por s1 min, w(90) por s2 min).
// remFrac(0) = 1 → o λ total da partida (incl. acréscimos) continua sendo la/lb.
const LIVE_F2 = 0.56; // fração dos gols do tempo regulamentar que cai no 2º tempo
const liveRemFrac = (tau, s1, s2, f2 = LIVE_F2) => {
  const b = (f2 - 0.5) / 1012.5, a = (1 - 4050 * b) / 90; // ∫₀⁹⁰w = 1; ∫₄₅⁹⁰w = f2
  const w45 = a + 45 * b, w90 = a + 90 * b;
  const phi = t => a * t + b * t * t / 2; // antiderivada de w
  const Z = 1 + s1 * w45 + s2 * w90;      // peso total da partida com acréscimos
  const T = Math.max(0, Math.min(tau, 90 + s1 + s2));
  let W;
  if (T <= 45) W = phi(T);
  else if (T <= 45 + s1) W = phi(45) + (T - 45) * w45;
  else if (T <= 90 + s1) W = phi(T - s1) + s1 * w45;
  else W = 1 + s1 * w45 + (T - 90 - s1) * w90;
  return Math.max(0, (Z - W) / Z);
};
// Display do relógio: τ = tempo decorrido (0..90+s1+s2) → "12'", "45+2'", "67'", "90+5'"
const fmtClock = (tau, s1) =>
  tau <= 45 ? `${Math.round(tau)}'`
  : tau <= 45 + s1 ? `45+${Math.round(tau - 45)}'`
  : tau <= 90 + s1 ? `${Math.round(tau - s1)}'`
  : `90+${Math.round(tau - 90 - s1)}'`;

// In-game probabilities: τ (tempo decorrido, incl. acréscimos), placar atual, vermelhos.
// λ restante = λ_total × remFrac(τ); vermelhos: 0.78× ao infrator, 1.12× ao adversário (por cartão).
const liveProbs = (a, b, tA, tB, { tau = 0, gA = 0, gB = 0, redsA = 0, redsB = 0, s1 = 4, s2 = 7 }) => {
  const { la, lb } = cL(a, b, matchTilt(tA, tB));
  const remFrac = liveRemFrac(tau, s1, s2);
  const adjA = Math.pow(0.78, redsA) * Math.pow(1.12, redsB);
  const adjB = Math.pow(0.78, redsB) * Math.pow(1.12, redsA);
  const laR = Math.max(0.001, la * remFrac * adjA);
  const lbR = Math.max(0.001, lb * remFrac * adjB);
  let pH = 0, pD = 0, pA = 0;
  const dist = {}; // distribuição conjunta do placar FINAL
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const p = pp(laR, i) * pp(lbR, j);
    const fA = gA + i, fB = gB + j;
    if (fA > fB) pH += p; else if (fA === fB) pD += p; else pA += p;
    dist[fA + '-' + fB] = p;
  }
  const t = pH + pD + pA;
  const scores = Object.entries(dist).map(([k, p]) => { const [sa, sb] = k.split('-').map(Number); return { a: sa, b: sb, p: p / t }; }).sort((x, y) => y.p - x.p);
  const pOf = (sa, sb) => (dist[sa + '-' + sb] || 0) / t;
  return { pH: pH / t * 100, pD: pD / t * 100, pA: pA / t * 100, laR, lbR, expScoreA: gA + laR, expScoreB: gB + lbR, scores, pOf };
};
// Estado do jogo derivado dos eventos minutados (gols/vermelhos) até τ, inclusive.
// ev: [{m, t:'g'|'r', s:'A'|'B'}], m na mesma linha do tempo do slider (0..90+s1+s2).
const evState = (ev, tau) => {
  const st = { gA: 0, gB: 0, redsA: 0, redsB: 0 };
  for (const e of ev || []) if (e.m <= tau) st[(e.t === 'g' ? 'g' : 'reds') + e.s]++;
  return st;
};
// Série da evolução de P(V/E/D) ao longo do jogo: τ inteiros + pares m−0.01/m em
// cada evento (degrau vertical limpo no gráfico).
// Sem eventos, usa `base` (placar/vermelhos manuais) como estado CONSTANTE — a curva
// "se o jogo continuar assim". `target` ({a,b}) adiciona pT = P(terminar a–b | estado em τ).
const liveSeriesCalc = (eH, eA, tA, tB, ev, s1, s2, base = { gA: 0, gB: 0, redsA: 0, redsB: 0 }, target = null) => {
  const total = 90 + s1 + s2;
  const hasEv = (ev || []).length > 0;
  const taus = [];
  for (let t = 0; t <= total; t++) taus.push(t);
  for (const e of ev || []) if (e.m >= 0 && e.m <= total) { taus.push(Math.max(0, e.m - 0.01)); taus.push(e.m); }
  taus.sort((a, b) => a - b);
  const out = [];
  let prev = -1;
  for (const tau of taus) {
    if (tau === prev) continue;
    prev = tau;
    const st = hasEv ? evState(ev, tau) : base;
    const p = liveProbs(eH, eA, tA, tB, { tau, ...st, s1, s2 });
    const pt = { tau, pH: p.pH, pD: p.pD, pA: p.pA };
    if (target) pt.pT = p.pOf(target.a, target.b) * 100;
    out.push(pt);
  }
  return out;
};

// Resolve classificação parcial baseada em resultados preenchidos + posições forçadas
const resolveStandings = (groups, userRes, forcedPos = {}) => {
  const tb = {};
  Object.entries(groups).forEach(([gn, ts]) => ts.forEach(t => { tb[t] = { g: gn, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0, p: 0 }; }));
  GS.forEach(([gn, hi, ai], idx) => {
    const fx = userRes[idx];
    if (fx?.gA == null || fx?.gB == null) return;
    const h = groups[gn][hi], a = groups[gn][ai];
    tb[h].gf += fx.gA; tb[h].ga += fx.gB; tb[h].gd += fx.gA - fx.gB; tb[h].p++;
    tb[a].gf += fx.gB; tb[a].ga += fx.gA; tb[a].gd += fx.gB - fx.gA; tb[a].p++;
    if (fx.gA > fx.gB) { tb[h].pts += 3; tb[h].w++; tb[a].l++; }
    else if (fx.gA < fx.gB) { tb[a].pts += 3; tb[a].w++; tb[h].l++; }
    else { tb[h].pts++; tb[a].pts++; tb[h].d++; tb[a].d++; }
  });
  const groupReady = {};
  const st = {};
  Object.entries(groups).forEach(([gn, ts]) => {
    const forced = forcedPos[gn];
    const allPlayed = ts.every(t => tb[t].p === 3);
    const fullForced = forced && [0,1,2,3].every(i => forced[i] || (forced.filter(Boolean).length === 3 && i === 3));
    groupReady[gn] = allPlayed || (forced && forced.filter(Boolean).length >= 3);
    let s;
    if (forced && forced.some(Boolean)) {
      const set = forced.filter(Boolean);
      const unset = ts.filter(t => !set.includes(t));
      const sortedUnset = unset.sort((a, b) => tb[b].pts - tb[a].pts || tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf);
      s = [];
      let ui = 0;
      for (let i = 0; i < 4; i++) { if (forced[i]) s.push(forced[i]); else if (sortedUnset[ui]) s.push(sortedUnset[ui++]); }
      while (s.length < 4 && ui < sortedUnset.length) s.push(sortedUnset[ui++]);
    } else {
      s = ts.slice().sort((a, b) => tb[b].pts - tb[a].pts || tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf);
    }
    st[gn] = { sorted: s };
  });
  const allReady = Object.values(groupReady).every(Boolean);
  const F = {}, S = {};
  Object.entries(st).forEach(([g, { sorted }]) => { if (groupReady[g]) { F[g] = sorted[0]; S[g] = sorted[1]; } });
  let asgn = {}, b8m = {};
  if (allReady) {
    const thirds = Object.entries(st).map(([g, { sorted }]) => ({ team: sorted[2], group: g, ...tb[sorted[2]] }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    const b8 = thirds.slice(0, 8);
    const b8g = b8.map(t => t.group).sort();
    b8m = Object.fromEntries(b8.map(t => [t.group, t.team]));
    asgn = solve3rd(b8g);
  }
  return { groupReady, allReady, F, S, asgn, b8m, tb, st };
};

// Resolve TODOS os 32 jogos do mata-mata: times conhecidos + vencedor (se placar preenchido)
const resolveKO = (standings, userRes) => {
  const out = {};
  for (let mn = 73; mn <= 104; mn++) {
    const sp = KO_SPEC[mn];
    const resSide = (side) => {
      if (side.t === 'pos') return standings.groupReady[side.g] ? (side.p === 1 ? standings.F[side.g] : standings.S[side.g]) : null;
      if (side.t === '3rd') return standings.allReady ? (standings.b8m[standings.asgn[side.s]] || null) : null;
      if (side.t === 'win') return out[side.m]?.winner || null;
      if (side.t === 'lose') { const prev = out[side.m]; if (!prev || !prev.winner) return null; return prev.winner === prev.h ? prev.a : prev.h; }
      return null;
    };
    const h = resSide(sp.h);
    const a = resSide(sp.a);
    const fx = userRes['k' + mn];
    let winner = null;
    if (fx?.gA != null && fx?.gB != null && h && a) {
      if (fx.gA > fx.gB) winner = h;
      else if (fx.gA < fx.gB) winner = a;
      else winner = fx.pw === 'B' ? a : h;
    }
    out[mn] = { mn, h, a, winner, fx, ph: sp.ph, l: sp.l };
  }
  return out;
};

// ── Desempate oficial FIFA (anexos) ───────────────────────────────────────────
// Step 1: confronto direto entre os empatados (pontos H2H → saldo H2H → gols H2H)
// Step 2: saldo geral → gols geral  (conduta/cartões: não simulável, pulado)
// Step 3: ranking FIFA
// Ordena `teams` e retorna { sorted, crit } onde crit[team] = critério que o colocou
// acima do PRÓXIMO time (ou null se separado por pontos gerais / sem empate).
const TIE_CRIT = { pts: 'pontos', h2hPts: 'confronto direto (pts)', h2hGd: 'confronto direto (saldo)', h2hGf: 'confronto direto (gols)', gd: 'saldo geral', gf: 'gols gerais', fifa: 'ranking FIFA', rand: 'sorteio' };
// mini-tabela do confronto direto dentro de um subconjunto de times empatados
const h2hTable = (subset, gm) => {
  const sset = new Set(subset);
  const m = {}; subset.forEach(t => { m[t] = { pts: 0, gd: 0, gf: 0 }; });
  gm.forEach(g => {
    if (g.gA == null || !sset.has(g.home) || !sset.has(g.away)) return;
    m[g.home].gf += g.gA; m[g.home].gd += g.gA - g.gB;
    m[g.away].gf += g.gB; m[g.away].gd += g.gB - g.gA;
    if (g.gA > g.gB) m[g.home].pts += 3; else if (g.gA < g.gB) m[g.away].pts += 3; else { m[g.home].pts++; m[g.away].pts++; }
  });
  return m;
};
// Resolve a ordem (e o critério) de um bloco de times com os MESMOS pontos gerais.
// Aplica Step 1 (H2H) sobre quem continuar empatado, depois Step 2/3.
const rankTied = (block, tb, gm, crit, rnd = Math.random) => {
  if (block.length === 1) return block;
  // Step 1 — confronto direto
  const h = h2hTable(block, gm);
  const cmp1 = (a, b) => h[b].pts - h[a].pts || h[b].gd - h[a].gd || h[b].gf - h[a].gf;
  const byH2H = [...block].sort(cmp1);
  const out = [];
  let i = 0;
  while (i < byH2H.length) {
    let j = i + 1;
    while (j < byH2H.length && h[byH2H[j]].pts === h[byH2H[i]].pts && h[byH2H[j]].gd === h[byH2H[i]].gd && h[byH2H[j]].gf === h[byH2H[i]].gf) j++;
    const same = byH2H.slice(i, j);
    if (same.length === 1) { out.push(same[0]); }
    else {
      // Step 2/3 sobre os que o H2H não separou: saldo geral → gols → FIFA → sorteio
      const byOverall = [...same].sort((a, b) => tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf || (FP[b] || 0) - (FP[a] || 0) || rnd() - .5);
      byOverall.forEach((t, k) => { out.push(t); if (k < byOverall.length - 1 && crit) {
        const A = byOverall[k], B = byOverall[k + 1];
        crit[A] = tb[A].gd !== tb[B].gd ? 'gd' : tb[A].gf !== tb[B].gf ? 'gf' : (FP[A] || 0) !== (FP[B] || 0) ? 'fifa' : 'rand';
      }});
    }
    // critério entre o último de `same` e o primeiro do próximo bloco H2H = confronto direto
    if (crit && j < byH2H.length) {
      const A = out[out.length - 1], B = byH2H[j];
      crit[A] = h[A].pts !== h[B].pts ? 'h2hPts' : h[A].gd !== h[B].gd ? 'h2hGd' : 'h2hGf';
    }
    i = j;
  }
  return out;
};
// Ordena um grupo inteiro pelos critérios FIFA. Retorna sorted + crit (critério que separou cada time do seguinte).
const rankGroup = (teams, tb, gm, rnd = Math.random) => {
  const crit = {};
  const byPts = [...teams].sort((a, b) => tb[b].pts - tb[a].pts);
  const sorted = [];
  let i = 0;
  while (i < byPts.length) {
    let j = i + 1;
    while (j < byPts.length && tb[byPts[j]].pts === tb[byPts[i]].pts) j++;
    const block = byPts.slice(i, j);
    const ordered = rankTied(block, tb, gm, crit, rnd);
    ordered.forEach(t => sorted.push(t));
    if (j < byPts.length) crit[sorted[sorted.length - 1]] = 'pts';
    i = j;
  }
  return { sorted, crit };
};
// ──────────────────────────────────────────────────────────────────────────────

const runSim = (groups, ur, fp, seed) => {
  // seed != null → toda a aleatoriedade vem de substreams determinísticos por jogo/decisão
  // (Common Random Numbers): dois runs com o mesmo seed e userRes diferindo em UM jogo
  // produzem exatamente os mesmos sorteios em todo o resto do torneio.
  const seeded = seed != null;
  const rndFor = seeded ? (k) => makeRnd(seed, k) : null;
  const tb = {};
  for (const [gn, ts] of Object.entries(groups)) ts.forEach(t => { tb[t] = { g: gn, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 }; });
  const pos = {};

  const gm = GS.map(([gn, hi, ai, date, city], idx) => {
    const ts = groups[gn], h = ts[hi], a = ts[ai];
    const rr = ur && ur[idx];
    let gA, gB;
    if (rr && rr.gA != null && rr.gB != null) { gA = rr.gA; gB = rr.gB; }
    else { const im = _injM[idx]; const r = sM(efCity(h, city) - (im ? (im.h || 0) * INJ_ELO : 0), efCity(a, city) - (im ? (im.a || 0) * INJ_ELO : 0), h, a, seeded ? rndFor(idx) : undefined); gA = r.gA; gB = r.gB; }
    tb[h].gf += gA; tb[h].ga += gB; tb[h].gd += gA - gB;
    tb[a].gf += gB; tb[a].ga += gA; tb[a].gd += gB - gA;
    if (gA > gB) { tb[h].pts += 3; tb[h].w++; tb[a].l++; }
    else if (gA < gB) { tb[a].pts += 3; tb[a].w++; tb[h].l++; }
    else { tb[h].pts++; tb[a].pts++; tb[h].d++; tb[a].d++; }
    return { group: gn, home: h, away: a, gA, gB, date, city, real: !!(rr && rr.gA != null), idx, brt: GS_BRT[idx] };
  });

  const st = {};
  const tieCrit = {}; // tieCrit[team] = critério que separou esse time do PRÓXIMO no grupo
  for (const [gn, ts] of Object.entries(groups)) {
    const forced = fp && fp[gn];
    const rndG = seeded ? rndFor(200 + gn.charCodeAt(0) - 65) : undefined; // substream do desempate deste grupo
    let s, crit = {};
    if (forced && forced.some(Boolean)) {
      const set = forced.filter(Boolean);
      const unset = ts.filter(t => !set.includes(t));
      const sortedUnset = rankGroup(unset, tb, gm, rndG).sorted;
      s = [];
      let ui = 0;
      for (let i = 0; i < 4; i++) {
        if (forced[i]) s.push(forced[i]);
        else if (i < 3 && sortedUnset[ui]) s.push(sortedUnset[ui++]);
        else if (sortedUnset[ui]) s.push(sortedUnset[ui++]);
      }
      while (s.length < 4 && ui < sortedUnset.length) s.push(sortedUnset[ui++]);
    } else {
      const rk = rankGroup(ts, tb, gm, rndG); s = rk.sorted; crit = rk.crit;
    }
    Object.assign(tieCrit, crit);
    st[gn] = { sorted: s, tb: Object.fromEntries(s.map(t => [t, tb[t]])) };
    s.forEach((t, i) => { pos[t] = gn + (i + 1); });
  }

  const rnd3 = seeded ? rndFor(240) : Math.random; // substream do sorteio entre 3ºs empatados
  const thirds = Object.entries(st).map(([g, { sorted }]) => ({ team: sorted[2], group: g, ...tb[sorted[2]] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || (FP[b.team] || 0) - (FP[a.team] || 0) || rnd3() - .5);
  const b8 = thirds.slice(0, 8), b8g = b8.map(t => t.group).sort();
  const b8m = Object.fromEntries(b8.map(t => [t.group, t.team]));
  const asgn = solve3rd(b8g);
  const F = {}, S = {};
  for (const [g, { sorted }] of Object.entries(st)) { F[g] = sorted[0]; S[g] = sorted[1]; }

  const r32 = [];
  const mk = (h, a, mn, d, c) => {
    const fx = ur && ur['k' + mn];
    let r;
    if (fx && fx.gA != null && fx.gB != null && fx.home === h && fx.away === a) {
      const w = fx.gA > fx.gB ? 'A' : fx.gA < fx.gB ? 'B' : (fx.pw === 'B' ? 'B' : 'A');
      r = { gA: fx.gA, gB: fx.gB, w, aet: false, pen: fx.gA === fx.gB };
    } else r = sKO(ef(h), ef(a), h, a, seeded ? rndFor(mn) : undefined); // CRN: mesmo substream por mn ainda que os participantes mudem entre os lados do par
    r32.push({ home: h, away: a, ...r, winner: r.w === 'A' ? h : a, mn, date: d, city: c, ph: pos[h], pa: pos[a], real: !!(fx && fx.home === h && fx.away === a) });
  };
  mk(S['A'], S['B'], 73, '28/Jun', 'Los Angeles');
  mk(F['E'], b8m[asgn['E']], 74, '29/Jun', 'Boston');
  mk(F['F'], S['C'], 75, '29/Jun', 'Monterrey');
  mk(F['C'], S['F'], 76, '29/Jun', 'Houston');
  mk(F['I'], b8m[asgn['I']], 77, '30/Jun', 'Nova York/NJ');
  mk(S['E'], S['I'], 78, '30/Jun', 'Dallas');
  mk(F['A'], b8m[asgn['A']], 79, '30/Jun', 'Cidade do México');
  mk(F['L'], b8m[asgn['L']], 80, '1/Jul', 'Atlanta');
  mk(F['D'], b8m[asgn['D']], 81, '1/Jul', 'São Francisco');
  mk(F['G'], b8m[asgn['G']], 82, '1/Jul', 'Seattle');
  mk(S['K'], S['L'], 83, '2/Jul', 'Toronto');
  mk(F['H'], S['J'], 84, '2/Jul', 'Los Angeles');
  mk(F['B'], b8m[asgn['B']], 85, '2/Jul', 'Vancouver');
  mk(F['J'], S['H'], 86, '3/Jul', 'Miami');
  mk(F['K'], b8m[asgn['K']], 87, '3/Jul', 'Kansas City');
  mk(S['D'], S['G'], 88, '3/Jul', 'Dallas');

  const mko = (h, a, d, c, mn) => {
    const fx = ur && ur['k' + mn];
    let r;
    if (fx && fx.gA != null && fx.gB != null && fx.home === h && fx.away === a) {
      const w = fx.gA > fx.gB ? 'A' : fx.gA < fx.gB ? 'B' : (fx.pw === 'B' ? 'B' : 'A');
      r = { gA: fx.gA, gB: fx.gB, w, aet: false, pen: fx.gA === fx.gB };
    } else r = sKO(efCity(h, c), efCity(a, c), h, a, seeded ? rndFor(mn) : undefined);
    return { home: h, away: a, ...r, winner: r.w === 'A' ? h : a, date: d, city: c, mn, ph: pos[h], pa: pos[a], real: !!(fx && fx.home === h && fx.away === a) };
  };

  // R16 OFICIAL: M89=W74×W77, M90=W73×W75, M91=W76×W78, M92=W79×W80, M93=W83×W84, M94=W81×W82, M95=W86×W88, M96=W85×W87
  const r16 = [
    mko(r32[1].winner, r32[4].winner, '4/Jul', 'Filadélfia', 89),
    mko(r32[0].winner, r32[2].winner, '4/Jul', 'Houston', 90),
    mko(r32[3].winner, r32[5].winner, '5/Jul', 'Nova York/NJ', 91),
    mko(r32[6].winner, r32[7].winner, '5/Jul', 'Cidade do México', 92),
    mko(r32[10].winner, r32[11].winner, '6/Jul', 'Dallas', 93),
    mko(r32[8].winner, r32[9].winner, '6/Jul', 'Seattle', 94),
    mko(r32[13].winner, r32[15].winner, '7/Jul', 'Atlanta', 95),
    mko(r32[12].winner, r32[14].winner, '7/Jul', 'Vancouver', 96),
  ];

  // QF: M97=W89×W90, M98=W93×W94, M99=W91×W92, M100=W95×W96
  const qf = [
    mko(r16[0].winner, r16[1].winner, '9/Jul', 'Boston', 97),
    mko(r16[4].winner, r16[5].winner, '10/Jul', 'Los Angeles', 98),
    mko(r16[2].winner, r16[3].winner, '11/Jul', 'Miami', 99),
    mko(r16[6].winner, r16[7].winner, '11/Jul', 'Kansas City', 100),
  ];

  const sf = [
    mko(qf[0].winner, qf[1].winner, '14/Jul', 'Dallas', 101),
    mko(qf[2].winner, qf[3].winner, '15/Jul', 'Atlanta', 102),
  ];
  const los = sf.map(m => m.winner === m.home ? m.away : m.home);
  const f3 = mko(los[0], los[1], '18/Jul', 'Miami', 103);
  const fin = mko(sf[0].winner, sf[1].winner, '19/Jul', 'MetLife', 104);
  return { gm, st, thirds, b8, b8g, asgn, r32, r16, qf, sf, f3, fin, tb, pos, tieCrit, worst3rd: b8[7] };
};

// ── Impacto instantâneo de um resultado ───────────────────────────────────────
// Mini-MC pareado de UM grupo: distribuição de posições finais por time.
// games: 6 × {key (idx do GS), h, a, eH, eA, fx:{gA,gB}|null}. CRN: chamar 2×
// com o MESMO seedBase (fx diferindo em 1 jogo) → jogos livres sorteiam idêntico
// nos dois lados e o Δ reflete só o efeito do resultado.
const groupPosProbs = (games, teams, gn, n, seedBase) => {
  const lam = games.map(g => g.fx ? null : cL(g.eH, g.eA, matchTilt(g.h, g.a))); // la/lb fixos por jogo — fora do loop
  const tieKey = 200 + gn.charCodeAt(0) - 65; // mesma chave de substream do runSim
  // por time: pos = contagem de 1º/2º/3º/4º; pts/gf/gd = SOMAS (÷n = média) para métricas extras
  const stat = {}; teams.forEach(t => { stat[t] = { pos: [0, 0, 0, 0], pts: 0, gf: 0, gd: 0 }; });
  for (let i = 0; i < n; i++) {
    const seed = seedBase + i;
    const tb = {}; teams.forEach(t => { tb[t] = { pts: 0, gd: 0, gf: 0 }; });
    const gm = games.map((g, k) => {
      let gA, gB;
      if (g.fx) { gA = g.fx.gA; gB = g.fx.gB; }
      else { const rnd = makeRnd(seed, g.key); gA = sP(lam[k].la, rnd); gB = sP(lam[k].lb, rnd); }
      tb[g.h].gf += gA; tb[g.h].gd += gA - gB; tb[g.a].gf += gB; tb[g.a].gd += gB - gA;
      if (gA > gB) tb[g.h].pts += 3; else if (gA < gB) tb[g.a].pts += 3; else { tb[g.h].pts++; tb[g.a].pts++; }
      return { home: g.h, away: g.a, gA, gB };
    });
    teams.forEach(t => { stat[t].pts += tb[t].pts; stat[t].gf += tb[t].gf; stat[t].gd += tb[t].gd; });
    rankGroup(teams, tb, gm, makeRnd(seed, tieKey)).sorted.forEach((t, p) => stat[t].pos[p]++);
  }
  return stat;
};
// P(A avançar) num mata-mata — analítico, espelha o sKO exatamente: cauda da
// Poisson colapsada em 7 gols (como sP), prorrogação com λ·0.33, pênaltis
// .5+(a−b)/4000 clampado. Grids somam 1 → pAdvA(a,b) + pAdvA(b,a) = 1.
const koAdvProb = (a, b, tA, tB) => {
  const { la, lb } = cL(a, b, matchTilt(tA, tB));
  const dist = l => { const d = []; let c = 0; for (let g = 0; g < 7; g++) { d.push(pp(l, g)); c += d[g]; } d.push(Math.max(0, 1 - c)); return d; };
  const agg = (dA, dB) => { let h = 0, e = 0, w = 0; for (let i = 0; i <= 7; i++) for (let j = 0; j <= 7; j++) { const p = dA[i] * dB[j]; if (i > j) h += p; else if (i === j) e += p; else w += p; } return { h, e, w }; };
  const r90 = agg(dist(la), dist(lb)), ret = agg(dist(la * .33), dist(lb * .33));
  const pen = Math.max(0, Math.min(1, .5 + (a - b) / 4000));
  return { pAdvA: r90.h + r90.e * (ret.h + ret.e * pen), r90, ret, pen };
};

// Monte Carlo
const mkKey = (a, b) => [a, b].sort().join('|');

// ── Filtro condicional (amostragem por rejeição) ──────────────────────────────
// Extrai os "eventos" de uma simulação para avaliar condições rapidamente.
const COND_TYPES = ['pos1','pos2','pos3','pos4','advance','elimGS','reachR16','reachQF','reachSF','reachFin','champ','faces'];
const COND_LABEL = { pos1:'termina em 1º do grupo', pos2:'termina em 2º do grupo', pos3:'termina em 3º do grupo', pos4:'termina em 4º do grupo', advance:'passa da fase de grupos', elimGS:'cai na fase de grupos', reachR16:'chega às oitavas (R16)', reachQF:'chega às quartas (QF)', reachSF:'chega à semifinal (SF)', reachFin:'chega à final', champ:'é campeã', faces:'enfrenta' };
const ROUND_LABEL = { any:'em qualquer fase', r32:'na R32', r16:'na R16', qf:'nas quartas', sf:'na semi', fin:'na final' };
const simEvents = (sim) => {
  const r32 = new Set(), r16 = new Set(), qf = new Set(), sf = new Set();
  sim.r32.forEach(m => { r32.add(m.home); r32.add(m.away); });
  sim.r16.forEach(m => { r16.add(m.home); r16.add(m.away); });
  sim.qf.forEach(m => { qf.add(m.home); qf.add(m.away); });
  sim.sf.forEach(m => { sf.add(m.home); sf.add(m.away); });
  return { r32, r16, qf, sf, finA: sim.fin.home, finB: sim.fin.away, champ: sim.fin.winner, pos: sim.pos };
};
const facesIn = (matches, A, B) => matches.some(m => (m.home === A && m.away === B) || (m.home === B && m.away === A));
const condOk = (sim, ev, c) => {
  switch (c.type) {
    case 'pos1': return ev.pos[c.team]?.slice(-1) === '1';
    case 'pos2': return ev.pos[c.team]?.slice(-1) === '2';
    case 'pos3': return ev.pos[c.team]?.slice(-1) === '3';
    case 'pos4': return ev.pos[c.team]?.slice(-1) === '4';
    case 'advance': return ev.r32.has(c.team);
    case 'elimGS': return !ev.r32.has(c.team);
    case 'reachR16': return ev.r16.has(c.team);
    case 'reachQF': return ev.qf.has(c.team);
    case 'reachSF': return ev.sf.has(c.team);
    case 'reachFin': return ev.finA === c.team || ev.finB === c.team;
    case 'champ': return ev.champ === c.team;
    case 'faces': {
      const rd = c.round || 'any';
      if (rd === 'any') return facesIn(sim.r32, c.team, c.target) || facesIn(sim.r16, c.team, c.target) || facesIn(sim.qf, c.team, c.target) || facesIn(sim.sf, c.team, c.target) || facesIn([sim.fin], c.team, c.target);
      const arr = rd === 'r32' ? sim.r32 : rd === 'r16' ? sim.r16 : rd === 'qf' ? sim.qf : rd === 'sf' ? sim.sf : [sim.fin];
      return facesIn(arr, c.team, c.target);
    }
    default: return true;
  }
};
const simAccepts = (sim, conditions) => {
  if (!conditions || !conditions.length) return true;
  const ev = simEvents(sim);
  return conditions.every(c => condOk(sim, ev, c));
};
// ──────────────────────────────────────────────────────────────────────────────

// Agrega estatísticas a partir de um pool de simulações já geradas, mantendo só as que
// satisfazem TODAS as condições. Permite re-filtrar em memória sem re-simular.
const aggregate = (pool, all, groups, conditions = []) => {
  const s = {};
  all.forEach(t => { s[t] = { g1: 0, g2: 0, g3a: 0, g3o: 0, g4: 0, r32: 0, r16: 0, qf: 0, sf: 0, fin: 0, ch: 0, p3: 0, p4: 0, ptsS: 0, gdS: 0, gfS: 0, wS: 0, dS: 0, lS: 0, oppR32S: 0, oppR32N: 0, oppR16S: 0, oppR16N: 0, oppQFS: 0, oppQFN: 0, oppSFS: 0, oppSFN: 0, oppFinS: 0, oppFinN: 0 }; });
  // Histogramas da fase de grupos por time (para medianas): pts, saldo (gd), gols (gf), vitórias/empates/derrotas
  const hist = {}; all.forEach(t => { hist[t] = { gd: {}, gf: {} }; });
  const wdHist = {}; all.forEach(t => { wdHist[t] = {}; }); // registro conjunto (vitórias_empates) por time
  const g3c = {};
  Object.keys(groups).forEach(g => { g3c[g] = 0; });
  const mu = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} };
  const posMu = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} };
  const posTm = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} }; // pos vs pos
  const posWho = {}; // posWho[pos] = {team: count}
  const tmPos = {}; // tmPos[team][rd] = {oppPos: count} -- team vs opp position
  const posVsTm = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} }; // posVsTm[rd][pos] = {oppTeam: count}
  all.forEach(t => { tmPos[t] = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} }; });
  const tm = {};
  all.forEach(t => { tm[t] = { r32: {}, r16: {}, qf: {}, sf: {}, fin: {} }; });
  const combos = {};
  const matchTm = {}; // matchTm[mn] = {teamPairKey: count} -- who plays each match
  const matchWho = {}; // matchWho[mn] = {team: count}
  const matchWin = {}; // matchWin[mn] = {team: count de sims em que t VENCE essa partida}
  const matchPos = {}; // matchPos[mn] = {posKey: count} e.g. "A1×E3"
  const duelPos = {}; // duelPos[teamPairKey][rd] = {posPairKey: count} -- positions in which two teams meet at each round
  const tpc = {}; // tpc[team][posKey] = {n, ch, r32:{opp:cnt}, r16:{}, qf:{}, sf:{}, fin:{}}
  all.forEach(t => { tpc[t] = {}; });
  const matchByG3 = {}; // matchByG3[mn] = {g3combo: {pairKey: cnt}}
  const matchChamp = {};
  const scoreDist = { gs: {}, ko: {} }; // {gs: {"2-1": count}, ko: {"1-0": count}}
  const cutoff3rd = []; // Array of {pts, gd, gf} for worst qualifying 3rd in each sim // matchChamp[mn] = count of sims where eventual champion played in this match
  // Avanço por registro exato (pts, saldo): conta TODOS os times (1°/2°/3°/4°) com cada registro e quantos avançaram.
  const recAdv = {}; // recAdv['pts|gd'] = { pts, gd, cnt, adv, n3, adv3 }
  const gsShift = {}; // gsShift[idx] = {H:{team:cnt}, D:{team:cnt}, A:{team:cnt}, nH:0, nD:0, nA:0}
  const koShift = {}; // koShift[mn] = {[winner]:{champ:cnt, total:cnt}}
  // Desempate: por grupo, conta quantas sims tiveram empate e qual critério decidiu, e por time.
  const tieAcc = {}; // tieAcc[group] = { any:cnt, byCrit:{crit:cnt}, teams:{team:{crit:cnt, total:cnt}} }
  Object.keys(groups).forEach(g => { tieAcc[g] = { any: 0, byCrit: {}, teams: {} }; });

  let nAccepted = 0;
  for (let i = 0; i < pool.length; i++) {
    const sim = pool[i];
    if (!simAccepts(sim, conditions)) continue; // amostragem por rejeição: mantém só os mundos que satisfazem TODAS as condições
    nAccepted++;
    for (const [gn, { sorted, tb }] of Object.entries(sim.st)) {
      s[sorted[0]].g1++; s[sorted[0]].r32++;
      s[sorted[1]].g2++; s[sorted[1]].r32++;
      // Track who finishes where + soma de pontos/saldo/gols (fase de grupos)
      sorted.forEach((t, pi) => {
        const pk = gn + (pi + 1);
        if (!posWho[pk]) posWho[pk] = {};
        posWho[pk][t] = (posWho[pk][t] || 0) + 1;
        if (tb && tb[t]) { s[t].ptsS += tb[t].pts; s[t].gdS += tb[t].gd; s[t].gfS += tb[t].gf; s[t].wS += tb[t].w; s[t].dS += tb[t].d; s[t].lS += tb[t].l;
          const ht = hist[t]; ht.gd[tb[t].gd] = (ht.gd[tb[t].gd] || 0) + 1; ht.gf[tb[t].gf] = (ht.gf[tb[t].gf] || 0) + 1;
          const wk = tb[t].w + '_' + tb[t].d; wdHist[t][wk] = (wdHist[t][wk] || 0) + 1;
        }
        // Avanço por registro exato (pts, saldo)
        if (tb && tb[t]) {
          const rk = tb[t].pts + '|' + tb[t].gd;
          if (!recAdv[rk]) recAdv[rk] = { pts: tb[t].pts, gd: tb[t].gd, cnt: 0, adv: 0, n3: 0, adv3: 0 };
          const ra2 = recAdv[rk]; ra2.cnt++;
          const advanced = pi <= 1 || (pi === 2 && sim.b8.some(b => b.team === t));
          if (advanced) ra2.adv++;
          if (pi === 2) { ra2.n3++; if (advanced) ra2.adv3++; }
        }
      });
      // Desempate: registra se algum critério além de "pontos" decidiu posições neste grupo
      const tc = sim.tieCrit || {};
      const ta = tieAcc[gn];
      const decided = sorted.filter(t => tc[t] && tc[t] !== 'pts'); // times separados do seguinte por desempate
      if (decided.length) {
        ta.any++;
        const used = new Set();
        decided.forEach(t => {
          const c = tc[t];
          if (!ta.teams[t]) ta.teams[t] = { total: 0, byCrit: {} };
          ta.teams[t].total++;
          ta.teams[t].byCrit[c] = (ta.teams[t].byCrit[c] || 0) + 1;
          used.add(c);
        });
        used.forEach(c => { ta.byCrit[c] = (ta.byCrit[c] || 0) + 1; });
      }
      const t3 = sorted[2];
      if (sim.b8.some(b => b.team === t3)) { s[t3].g3a++; s[t3].r32++; g3c[gn]++; }
      else { s[t3].g3o++; }
      s[sorted[3]].g4++;
    }
    // Build position map for this sim
    const simPos = {};
    for (const [gn2, { sorted: s2 }] of Object.entries(sim.st)) s2.forEach((t, pi) => { simPos[t] = gn2 + (pi+1); });
    const g3k = sim.b8g.join('');
    const cK = g3k;
    if (sim.worst3rd) cutoff3rd.push({ pts: sim.worst3rd.pts, gd: sim.worst3rd.gd, gf: sim.worst3rd.gf });
    combos[cK] = (combos[cK] || 0) + 1;
    const track = (matches, rd) => {
      matches.forEach(m => {
        const k = mkKey(m.home, m.away);
        mu[rd][k] = (mu[rd][k] || 0) + 1;
        tm[m.home][rd][m.away] = (tm[m.home][rd][m.away] || 0) + 1;
        tm[m.away][rd][m.home] = (tm[m.away][rd][m.home] || 0) + 1;
        // Match-level tracking (by match number)
        if (m.mn) {
          if (!matchTm[m.mn]) matchTm[m.mn] = {};
          matchTm[m.mn][k] = (matchTm[m.mn][k] || 0) + 1;
          if (!matchWho[m.mn]) matchWho[m.mn] = {};
          matchWho[m.mn][m.home] = (matchWho[m.mn][m.home] || 0) + 1;
          matchWho[m.mn][m.away] = (matchWho[m.mn][m.away] || 0) + 1;
          if (m.winner) {
            if (!matchWin[m.mn]) matchWin[m.mn] = {};
            matchWin[m.mn][m.winner] = (matchWin[m.mn][m.winner] || 0) + 1;
          }
          if (m.ph && m.pa) {
            if (!matchPos[m.mn]) matchPos[m.mn] = {};
            const ppk = m.ph + '×' + m.pa;
            matchPos[m.mn][ppk] = (matchPos[m.mn][ppk] || 0) + 1;
          }
        }
        // Position-based tracking
        if (m.ph && m.pa) {
          const pk = m.ph + '×' + m.pa;
          posMu[rd][pk] = (posMu[rd][pk] || 0) + 1;
          if (!posTm[rd][m.ph]) posTm[rd][m.ph] = {};
          if (!posTm[rd][m.pa]) posTm[rd][m.pa] = {};
          posTm[rd][m.ph][m.pa] = (posTm[rd][m.ph][m.pa] || 0) + 1;
          posTm[rd][m.pa][m.ph] = (posTm[rd][m.pa][m.ph] || 0) + 1;
          // Cross: team vs opp position
          tmPos[m.home][rd][m.pa] = (tmPos[m.home][rd][m.pa] || 0) + 1;
          tmPos[m.away][rd][m.ph] = (tmPos[m.away][rd][m.ph] || 0) + 1;
          // Cross: position vs opp team
          if (!posVsTm[rd][m.ph]) posVsTm[rd][m.ph] = {};
          if (!posVsTm[rd][m.pa]) posVsTm[rd][m.pa] = {};
          posVsTm[rd][m.ph][m.away] = (posVsTm[rd][m.ph][m.away] || 0) + 1;
          posVsTm[rd][m.pa][m.home] = (posVsTm[rd][m.pa][m.home] || 0) + 1;
          // Per-duel position-pair tracking (for Duelo tab drilldown)
          if (!duelPos[k]) duelPos[k] = {};
          if (!duelPos[k][rd]) duelPos[k][rd] = {};
          const [first] = k.split('|');
          const firstPos = m.home === first ? m.ph : m.pa;
          const secondPos = m.home === first ? m.pa : m.ph;
          const dpk = firstPos + '|' + secondPos;
          duelPos[k][rd][dpk] = (duelPos[k][rd][dpk] || 0) + 1;
        }
      });
    };
    track(sim.r32, 'r32');
    sim.r32.forEach(m => { if (s[m.winner]) s[m.winner].r16++; }); // R32 winner reaches R16
    track(sim.r16, 'r16');
    sim.r16.forEach(m => { if (s[m.winner]) s[m.winner].qf++; }); // R16 winner reaches QF
    track(sim.qf, 'qf');
    sim.qf.forEach(m => { if (s[m.winner]) s[m.winner].sf++; }); // QF winner reaches SF
    track(sim.sf, 'sf');
    track([sim.fin], 'fin');
    // Track f3 match number only
    if (sim.f3.mn) {
      const fk3 = mkKey(sim.f3.home, sim.f3.away);
      if (!matchTm[sim.f3.mn]) matchTm[sim.f3.mn] = {};
      matchTm[sim.f3.mn][fk3] = (matchTm[sim.f3.mn][fk3] || 0) + 1;
      if (!matchWho[sim.f3.mn]) matchWho[sim.f3.mn] = {};
      matchWho[sim.f3.mn][sim.f3.home] = (matchWho[sim.f3.mn][sim.f3.home] || 0) + 1;
      matchWho[sim.f3.mn][sim.f3.away] = (matchWho[sim.f3.mn][sim.f3.away] || 0) + 1;
      if (sim.f3.ph && sim.f3.pa) {
        if (!matchPos[sim.f3.mn]) matchPos[sim.f3.mn] = {};
        const ppk3 = sim.f3.ph + '×' + sim.f3.pa;
        matchPos[sim.f3.mn][ppk3] = (matchPos[sim.f3.mn][ppk3] || 0) + 1;
      }
    }
    if (s[sim.fin.home]) s[sim.fin.home].fin++;
    if (s[sim.fin.away]) s[sim.fin.away].fin++;
    if (s[sim.fin.winner]) s[sim.fin.winner].ch++;
    if (s[sim.f3.winner]) s[sim.f3.winner].p3++;
    const f3Loser = sim.f3.winner === sim.f3.home ? sim.f3.away : sim.f3.home;
    if (s[f3Loser]) s[f3Loser].p4++;
    // Track champion's path
    const champ = sim.fin.winner;
    // Track champion's group stage games
    sim.gm.forEach((m, idx) => {
      const gmn = idx + 1;
      if (m.home === champ || m.away === champ) matchChamp[gmn] = (matchChamp[gmn] || 0) + 1;
      // Score distribution (normalized: higher score first)
      const sk = m.gA >= m.gB ? `${m.gA}-${m.gB}` : `${m.gB}-${m.gA}`;
      scoreDist.gs[sk] = (scoreDist.gs[sk] || 0) + 1;
    });
    [...sim.r32, ...sim.r16, ...sim.qf, ...sim.sf, sim.fin].forEach(m => {
      // Score distribution for KO
      if (m?.gA != null) {
        const sk = m.gA >= m.gB ? `${m.gA}-${m.gB}` : `${m.gB}-${m.gA}`;
        scoreDist.ko[sk] = (scoreDist.ko[sk] || 0) + 1;
      }
      // Track opponent Elo per KO phase
      if (m?.home && m?.away) {
        const eH = rtBase(m.home), eA = rtBase(m.away);
        const ph = m.mn <= 88 ? 'R32' : m.mn <= 96 ? 'R16' : m.mn <= 100 ? 'QF' : m.mn <= 102 ? 'SF' : 'Fin';
        if (s[m.home]) { s[m.home]['opp'+ph+'S'] += eA; s[m.home]['opp'+ph+'N']++; }
        if (s[m.away]) { s[m.away]['opp'+ph+'S'] += eH; s[m.away]['opp'+ph+'N']++; }
      }
      if (m?.mn && (m.home === champ || m.away === champ)) {
        matchChamp[m.mn] = (matchChamp[m.mn] || 0) + 1;
      }
      // KO title shift: track champion by match winner
      if (m?.mn) {
        if (!koShift[m.mn]) koShift[m.mn] = {};
        const w = m.winner;
        if (!koShift[m.mn][w]) koShift[m.mn][w] = {total:0};
        koShift[m.mn][w].total++;
        koShift[m.mn][w][champ] = (koShift[m.mn][w][champ] || 0) + 1;
      }
    });
    // GS title shift: track champion by each game's outcome
    sim.gm.forEach((m, idx) => {
      if (!gsShift[idx]) gsShift[idx] = {H:{},D:{},A:{},nH:0,nD:0,nA:0};
      const outcome = m.gA > m.gB ? 'H' : m.gA < m.gB ? 'A' : 'D';
      gsShift[idx]['n'+outcome]++;
      gsShift[idx][outcome][champ] = (gsShift[idx][outcome][champ] || 0) + 1;
    });
    // Position-conditioned tracking
    const allKO = [...sim.r32, ...sim.r16, ...sim.qf, ...sim.sf, sim.fin, sim.f3];
    for (const t of all) {
      const pk = simPos[t]; if (!pk) continue;
      if (!tpc[t][pk]) tpc[t][pk] = {n:0, ch:0, r32:{}, r16:{}, qf:{}, sf:{}, fin:{}, mn:{}};
      tpc[t][pk].n++;
      if (sim.fin.winner === t) tpc[t][pk].ch++;
    }
    const tpcRd = (ms, rd) => { ms.forEach(m => {
      if (!m) return;
      [m.home, m.away].forEach(t => {
        const pk = simPos[t]; if (!pk || !tpc[t]?.[pk]) return;
        const o = t === m.home ? m.away : m.home;
        tpc[t][pk][rd][o] = (tpc[t][pk][rd][o] || 0) + 1;
      });
    }); };
    tpcRd(sim.r32, 'r32'); tpcRd(sim.r16, 'r16'); tpcRd(sim.qf, 'qf'); tpcRd(sim.sf, 'sf'); tpcRd([sim.fin], 'fin');
    // Track match numbers per position
    [...sim.r32, ...sim.r16, ...sim.qf, ...sim.sf, sim.fin, sim.f3].forEach(m => {
      if (!m?.mn) return;
      [m.home, m.away].forEach(t => {
        const pk = simPos[t]; if (!pk || !tpc[t]?.[pk]) return;
        tpc[t][pk].mn[m.mn] = (tpc[t][pk].mn[m.mn] || 0) + 1;
      });
    });
    // G3-filtered match tracking
    allKO.forEach(m => {
      if (!m?.mn) return;
      const k = mkKey(m.home, m.away);
      if (!matchByG3[m.mn]) matchByG3[m.mn] = {};
      if (!matchByG3[m.mn][g3k]) matchByG3[m.mn][g3k] = {};
      matchByG3[m.mn][g3k][k] = (matchByG3[m.mn][g3k][k] || 0) + 1;
    });
  }

  const p = {};
  const D = nAccepted || 1; // denominador condicional: divide pelas simulações que passaram no filtro
  all.forEach(t => { p[t] = {}; for (const k of Object.keys(s[t])) p[t][k] = (k === 'ptsS' || k === 'gdS' || k === 'gfS' || k === 'wS' || k === 'dS' || k === 'lS') ? (s[t][k] / D) : (s[t][k] / D) * 100; p[t].avgPts = p[t].ptsS; p[t].avgGd = p[t].gdS; p[t].avgGf = p[t].gfS; p[t].avgW = p[t].wS; p[t].avgD = p[t].dS; p[t].avgL = p[t].lS;
    const ht = hist[t]; p[t].medGd = medianFromHist(ht.gd, D); p[t].medGf = medianFromHist(ht.gf, D); p[t].modGd = modeFromHist(ht.gd); p[t].modGf = modeFromHist(ht.gf);
    // Pts e V/E/D vêm do MESMO registro (consistentes): pts = 3·V + E
    const wmd = wdMedian(wdHist[t], D); p[t].medPts = wmd.pts; p[t].medW = wmd.w; p[t].medD = wmd.d; p[t].medL = 3 - wmd.w - wmd.d;
    const wmo = wdMode(wdHist[t]); p[t].modPts = wmo.pts; p[t].modW = wmo.w; p[t].modD = wmo.d; p[t].modL = 3 - wmo.w - wmo.d;
  });
  const g3p = {};
  Object.keys(g3c).forEach(g => { g3p[g] = (g3c[g] / D) * 100; });
  const muPct = {};
  for (const rd of Object.keys(mu)) {
    muPct[rd] = Object.entries(mu[rd]).map(([k, c]) => { const [a, b] = k.split('|'); return { a, b, pct: (c / D) * 100 }; }).sort((x, y) => y.pct - x.pct);
  }
  const comboList = Object.entries(combos).map(([k, c]) => ({ key: k, pct: (c / D) * 100 })).sort((a, b) => b.pct - a.pct);
  const tmPct = {};
  all.forEach(t => {
    tmPct[t] = {};
    for (const rd of ['r32', 'r16', 'qf', 'sf', 'fin']) {
      tmPct[t][rd] = Object.entries(tm[t][rd]).map(([o, c]) => ({ o, pct: (c / D) * 100 })).sort((a, b) => b.pct - a.pct);
    }
  });
  return { p, g3p, muPct, comboList, tmPct, posMu, posTm, posWho, tmPos, posVsTm, matchTm, matchWho, matchWin, matchPos, duelPos, tpc, matchByG3, matchChamp, gsShift, koShift, cutoff3rd, scoreDist, tieAcc, recAdv, nAccepted };
};

// Gera o pool de simulações uma única vez e agrega. Retorna também o pool para
// permitir re-filtragem instantânea em memória (sem re-simular) via reaggregate.
const runMC = (groups, n, ur, conditions = []) => {
  const all = Object.values(groups).flat();
  const pool = new Array(n);
  for (let i = 0; i < n; i++) pool[i] = runSim(groups, ur);
  const agg = aggregate(pool, all, groups, conditions);
  return { ...agg, n, pool, all };
};

const DYN_K = 20; // K fixo do Elo dinâmico (sem multiplicador de margem de vitória)
// Elo dinâmico: atualiza a força a partir dos jogos de GRUPO já disputados, em ordem de data.
// Vitória=1, empate=0.5, derrota=0 (sem margem). Retorna { time: ΔElo } a somar sobre rtRaw.
// Depende dos globais de modelo (_rSys etc.) estarem sincronizados pelo chamador.
const computeDynAdj = (groups, ur, K = DYN_K) => {
  const adj = {};
  const r = t => rtRaw(t) + (adj[t] || 0);
  const idxs = [];
  GS.forEach((row, i) => { if (ur && ur[i] && ur[i].gA != null && ur[i].gB != null) idxs.push(i); });
  idxs.sort((a, b) => dateKey(GS[a][3]) - dateKey(GS[b][3]) || (GS_BRT[a] || '').localeCompare(GS_BRT[b] || ''));
  idxs.forEach(i => {
    const [gn, hi, ai] = GS[i];
    const h = groups[gn][hi], a = groups[gn][ai], { gA, gB } = ur[i];
    const exH = 1 / (1 + Math.pow(10, (r(a) - r(h)) / 400));
    const dH = K * ((gA > gB ? 1 : gA < gB ? 0 : 0.5) - exH);
    adj[h] = (adj[h] || 0) + dH; adj[a] = (adj[a] || 0) - dH;
  });
  return adj;
};

// Re-agrega um pool existente sob novas condições — instantâneo, mesmo universo de sims (sem ruído).
const reaggregate = (pool, all, groups, conditions = []) => {
  const agg = aggregate(pool, all, groups, conditions);
  return { ...agg, n: pool.length };
};

// ============================================================================
// === WCH:BEGIN (gerado por _build/gen_h2h.cjs — não editar à mão) ===
// Confrontos de Copas do Mundo (masc., 1930-2022) entre os times do app.
// Fonte: Fjelstul World Cup Database (CC-BY 4.0) — github.com/jfjelstul/worldcup
// Formato: [ano, fase, home, away, golsH, golsA, p, replay?]; p = 0 | 1 (prorrogação) | 'X-Y' (pênaltis)
const WCH_TEAMS = ['Algeria', 'Argentina', 'Australia', 'Austria', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Canada', 'Colombia', 'Croatia', 'Czechia', 'DR Congo', 'Denmark', 'Ecuador', 'Egypt', 'England', 'France', 'Germany', 'Ghana', 'Haiti', 'Iran', 'Iraq', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Panama', 'Paraguay', 'Poland', 'Portugal', 'Qatar', 'Saudi Arabia', 'Scotland', 'Senegal', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Tunisia', 'Türkiye', 'USA', 'Uruguay'];
const WCH_ST = { G: 'Grupos', G2: '2ª fase de grupos', R1: '1ª fase', R2: '2ª fase', FR: 'Rodada final', R16: 'Oitavas', QF: 'Quartas', SF: 'Semifinal', TP: '3º lugar', F: 'FINAL' };
const WCH = [[1930,'G',17,27,4,1,0],[1930,'G',47,4,3,0,0],[1930,'G',1,17,1,0,0],[1930,'G',47,33,3,0,0],[1930,'G',1,27,6,3,0],[1930,'G',7,5,4,0,0],[1930,'G',33,4,1,0,0],[1930,'SF',1,47,6,1,0],[1930,'F',48,1,4,2,0],[1934,'R16',3,17,3,2,1],[1934,'R16',18,4,5,2,0],[1934,'R16',23,47,7,1,0],[1934,'R16',42,7,3,1,0],[1934,'R16',43,1,3,2,0],[1934,'R16',44,29,3,2,0],[1934,'QF',11,44,3,2,0],[1934,'QF',18,43,2,1,0],[1934,'QF',23,42,1,1,1],[1934,'QF',23,42,1,0,0,1],[1934,'SF',11,18,3,1,0],[1934,'SF',23,3,1,0,0],[1934,'TP',18,3,3,2,0],[1934,'F',23,11,2,1,1],[1938,'R16',44,18,1,1,1],[1938,'R16',17,4,3,1,0],[1938,'R16',23,31,2,1,1],[1938,'R16',7,34,6,5,1],[1938,'R16',11,29,3,0,1],[1938,'R16',44,18,4,2,0,1],[1938,'QF',7,11,1,1,1],[1938,'QF',23,17,3,1,0],[1938,'QF',7,11,2,1,0,1],[1938,'SF',23,7,2,1,0],[1938,'TP',7,43,4,2,0],[1950,'G',7,27,4,0,0],[1950,'G',42,47,3,1,0],[1950,'G',43,23,3,2,0],[1950,'G',7,44,2,2,0],[1950,'G',47,16,1,0,0],[1950,'G',43,33,2,2,0],[1950,'G',42,16,1,0,0],[1950,'G',23,33,2,0,0],[1950,'G',48,5,8,0,0],[1950,'G',44,27,2,1,0],[1950,'FR',7,43,7,1,0],[1950,'FR',48,42,2,2,0],[1950,'FR',7,42,6,1,0],[1950,'FR',48,43,3,2,0],[1950,'FR',43,42,3,1,0],[1950,'FR',48,7,2,1,0],[1954,'G',7,27,5,0,0],[1954,'G',3,38,1,0,0],[1954,'G',48,11,2,0,0],[1954,'G',44,23,2,1,0],[1954,'G',18,46,4,1,0],[1954,'G',16,4,4,4,1],[1954,'G',48,38,7,0,0],[1954,'G',3,11,5,0,0],[1954,'G',17,27,3,2,0],[1954,'G',46,41,7,0,0],[1954,'G',23,4,4,1,0],[1954,'G',16,44,2,0,0],[1954,'G',18,46,7,2,0],[1954,'G',44,23,4,1,0],[1954,'QF',3,44,7,5,0],[1954,'QF',48,16,4,2,0],[1954,'SF',18,3,6,1,0],[1954,'TP',3,48,3,1,0],[1958,'G',43,27,3,0,0],[1958,'G',1,18,1,3,0],[1958,'G',17,33,7,3,0],[1958,'G',7,3,3,0,0],[1958,'G',18,11,2,2,0],[1958,'G',33,38,3,2,0],[1958,'G',7,16,0,0,0],[1958,'G',11,1,6,1,0],[1958,'G',17,38,2,1,0],[1958,'G',16,3,2,2,0],[1958,'SF',7,17,5,2,0],[1958,'SF',43,18,3,1,0],[1958,'TP',17,18,6,3,0],[1958,'F',7,43,5,2,0],[1962,'G',48,9,2,1,0],[1962,'G',7,27,2,0,0],[1962,'G',18,23,0,0,0],[1962,'G',11,42,1,0,0],[1962,'G',7,11,0,0,0],[1962,'G',16,1,3,1,0],[1962,'G',18,44,2,1,0],[1962,'G',42,27,1,0,0],[1962,'G',7,42,2,1,0],[1962,'G',23,44,3,0,0],[1962,'G',27,11,3,1,0],[1962,'QF',7,16,3,1,0],[1962,'F',7,11,3,1,0],[1966,'G',16,48,0,0,0],[1966,'G',18,44,5,0,0],[1966,'G',17,27,1,1,0],[1966,'G',1,42,2,1,0],[1966,'G',48,17,2,1,0],[1966,'G',42,44,2,1,0],[1966,'G',1,18,0,0,0],[1966,'G',16,27,2,0,0],[1966,'G',27,48,0,0,0],[1966,'G',1,44,2,0,0],[1966,'G',35,7,3,1,0],[1966,'G',16,17,2,0,0],[1966,'G',18,42,2,1,0],[1966,'QF',16,1,1,0,0],[1966,'QF',18,48,4,0,0],[1966,'SF',16,35,2,1,0],[1966,'F',16,18,4,2,1],[1970,'G',23,43,1,0,0],[1970,'G',7,11,4,1,0],[1970,'G',18,28,2,1,0],[1970,'G',48,23,0,0,0],[1970,'G',7,16,1,0,0],[1970,'G',43,48,1,0,0],[1970,'G',27,4,1,0,0],[1970,'G',16,11,1,0,0],[1970,'QF',23,27,4,1,0],[1970,'QF',18,16,3,2,1],[1970,'SF',7,48,3,1,0],[1970,'SF',23,18,4,3,1],[1970,'TP',18,48,1,0,0],[1970,'F',7,23,4,1,0],[1974,'G',12,38,0,2,0],[1974,'G',48,29,0,2,0],[1974,'G',23,20,3,1,0],[1974,'G',34,1,3,2,0],[1974,'G',2,18,0,3,0],[1974,'G',38,7,0,0,0],[1974,'G',29,43,0,0,0],[1974,'G',1,23,1,1,0],[1974,'G',20,34,0,7,0],[1974,'G',12,7,0,3,0],[1974,'G',43,48,3,0,0],[1974,'G',1,20,4,1,0],[1974,'G',34,23,2,1,0],[1974,'G2',29,1,4,0,0],[1974,'G2',43,34,0,1,0],[1974,'G2',1,7,1,2,0],[1974,'G2',18,43,4,2,0],[1974,'G2',34,18,0,1,0],[1974,'G2',29,7,2,0,0],[1974,'TP',7,34,0,1,0],[1974,'F',29,18,1,2,0],[1978,'G',18,34,0,0,0],[1978,'G',23,17,2,1,0],[1978,'G',45,27,3,1,0],[1978,'G',3,42,2,1,0],[1978,'G',7,43,1,1,0],[1978,'G',29,21,3,0,0],[1978,'G',34,45,1,0,0],[1978,'G',18,27,6,0,0],[1978,'G',1,17,2,1,0],[1978,'G',3,43,1,0,0],[1978,'G',7,42,0,0,0],[1978,'G',38,21,1,1,0],[1978,'G',34,27,3,1,0],[1978,'G',18,45,0,0,0],[1978,'G',1,23,0,1,0],[1978,'G',7,3,1,0,0],[1978,'G',42,43,1,0,0],[1978,'G',38,29,3,2,0],[1978,'G2',3,29,1,5,0],[1978,'G2',23,18,0,0,0],[1978,'G2',1,34,2,0,0],[1978,'G2',23,3,1,0,0],[1978,'G2',29,18,2,2,0],[1978,'G2',1,7,0,0,0],[1978,'G2',3,18,3,2,0],[1978,'G2',23,29,1,2,0],[1978,'G2',7,34,3,1,0],[1978,'TP',7,23,2,1,0],[1978,'F',1,29,3,1,1],[1982,'G',1,4,0,1,0],[1982,'G',23,34,0,0,0],[1982,'G',38,30,5,2,0],[1982,'G',18,0,1,2,0],[1982,'G',16,17,3,1,0],[1982,'G',7,38,4,1,0],[1982,'G',16,11,2,0,0],[1982,'G',0,3,0,2,0],[1982,'G',7,30,4,0,0],[1982,'G',17,11,1,1,0],[1982,'G',18,3,1,0,0],[1982,'G2',3,17,0,1,0],[1982,'G2',34,4,3,0,0],[1982,'G2',23,1,2,1,0],[1982,'G2',18,16,0,0,0],[1982,'G2',1,7,1,3,0],[1982,'G2',18,42,2,1,0],[1982,'G2',23,7,3,2,0],[1982,'G2',42,16,0,0,0],[1982,'SF',34,23,0,2,0],[1982,'SF',18,17,3,3,'5-4'],[1982,'TP',34,17,3,2,0],[1982,'F',23,18,3,1,0],[1986,'G',42,7,0,1,0],[1986,'G',8,17,0,1,0],[1986,'G',1,41,3,1,0],[1986,'G',28,34,0,0,0],[1986,'G',4,27,1,2,0],[1986,'G',35,16,1,0,0],[1986,'G',33,22,1,0,0],[1986,'G',48,18,1,1,0],[1986,'G',38,13,0,1,0],[1986,'G',23,1,1,1,0],[1986,'G',7,0,1,0,0],[1986,'G',16,28,0,0,0],[1986,'G',27,33,1,1,0],[1986,'G',34,35,1,0,0],[1986,'G',22,4,1,2,0],[1986,'G',18,38,2,1,0],[1986,'G',13,48,6,1,0],[1986,'G',41,23,2,3,0],[1986,'G',22,27,0,1,0],[1986,'G',33,4,2,2,0],[1986,'G',16,34,3,0,0],[1986,'G',35,28,1,3,0],[1986,'G',0,42,0,3,0],[1986,'G',13,18,2,0,0],[1986,'G',38,48,0,0,0],[1986,'R16',7,34,4,0,0],[1986,'R16',1,48,1,0,0],[1986,'R16',23,17,0,2,0],[1986,'R16',28,18,0,1,0],[1986,'R16',16,33,3,0,0],[1986,'R16',13,42,1,5,0],[1986,'QF',7,17,1,1,'3-4'],[1986,'QF',18,27,0,0,'4-1'],[1986,'QF',1,16,2,1,0],[1986,'QF',42,4,1,1,'4-5'],[1986,'SF',17,18,0,2,0],[1986,'SF',1,4,2,0,0],[1986,'TP',4,17,2,4,1],[1986,'F',1,18,3,2,0],[1990,'G',23,3,1,0,0],[1990,'G',47,11,1,5,0],[1990,'G',7,43,2,1,0],[1990,'G',4,41,2,0,0],[1990,'G',29,15,1,1,0],[1990,'G',48,42,0,0,0],[1990,'G',23,47,1,0,0],[1990,'G',3,11,0,1,0],[1990,'G',43,38,1,2,0],[1990,'G',16,29,0,0,0],[1990,'G',4,48,3,1,0],[1990,'G',41,42,1,3,0],[1990,'G',18,9,1,1,0],[1990,'G',3,47,2,1,0],[1990,'G',23,11,2,0,0],[1990,'G',7,38,1,0,0],[1990,'G',4,42,1,2,0],[1990,'G',41,48,0,1,0],[1990,'G',16,15,1,0,0],[1990,'R16',7,1,0,1,0],[1990,'R16',18,29,2,1,0],[1990,'R16',23,48,2,0,0],[1990,'R16',16,4,1,0,1],[1990,'QF',11,18,0,1,0],[1990,'SF',1,23,1,1,'4-3'],[1990,'SF',18,16,1,1,'4-3'],[1990,'TP',23,16,2,1,0],[1990,'F',18,1,1,0,0],[1994,'G',18,5,1,0,0],[1994,'G',42,41,2,2,0],[1994,'G',47,44,1,1,0],[1994,'G',4,28,1,0,0],[1994,'G',31,27,1,0,0],[1994,'G',29,37,2,1,0],[1994,'G',18,42,1,1,0],[1994,'G',47,9,2,1,0],[1994,'G',23,31,1,0,0],[1994,'G',41,5,0,0,0],[1994,'G',4,29,1,0,0],[1994,'G',37,28,2,1,0],[1994,'G',44,9,0,2,0],[1994,'G',5,42,1,3,0],[1994,'G',18,41,3,2,0],[1994,'G',23,27,1,1,0],[1994,'G',7,43,1,1,0],[1994,'G',4,37,0,1,0],[1994,'G',28,29,1,2,0],[1994,'R16',18,4,3,2,0],[1994,'R16',42,44,3,0,0],[1994,'R16',37,43,1,3,0],[1994,'R16',7,47,1,0,0],[1994,'QF',23,42,2,1,0],[1994,'QF',29,7,2,3,0],[1994,'SF',43,7,0,1,0],[1994,'F',7,23,0,0,'3-2'],[1998,'G',7,38,2,1,0],[1998,'G',28,31,2,2,0],[1998,'G',37,13,0,1,0],[1998,'G',17,40,3,0,0],[1998,'G',41,27,1,3,0],[1998,'G',29,4,0,0,0],[1998,'G',1,26,1,0,0],[1998,'G',25,10,1,3,0],[1998,'G',16,45,2,0,0],[1998,'G',18,47,2,0,0],[1998,'G',38,31,1,1,0],[1998,'G',7,28,3,0,0],[1998,'G',40,13,1,1,0],[1998,'G',17,37,4,0,0],[1998,'G',42,33,0,0,0],[1998,'G',26,10,0,1,0],[1998,'G',4,27,2,2,0],[1998,'G',29,41,5,0,0],[1998,'G',1,25,5,0,0],[1998,'G',47,21,1,2,0],[1998,'G',9,45,1,0,0],[1998,'G',23,3,2,1,0],[1998,'G',7,31,1,2,0],[1998,'G',38,28,0,3,0],[1998,'G',17,13,2,1,0],[1998,'G',40,37,2,2,0],[1998,'G',4,41,1,1,0],[1998,'G',29,27,2,2,0],[1998,'G',18,21,2,0,0],[1998,'G',1,10,1,0,0],[1998,'G',26,25,1,2,0],[1998,'G',9,16,0,2,0],[1998,'R16',23,31,1,0,0],[1998,'R16',17,33,1,0,1],[1998,'R16',18,27,2,1,0],[1998,'R16',1,16,2,2,'4-3'],[1998,'QF',23,17,0,0,'3-4'],[1998,'QF',7,13,3,2,0],[1998,'QF',29,1,2,1,0],[1998,'QF',18,10,0,3,0],[1998,'SF',7,29,1,1,'4-2'],[1998,'SF',17,10,2,1,0],[1998,'TP',29,10,1,2,0],[1998,'F',7,17,0,3,0],[2002,'G',17,39,0,1,0],[2002,'G',48,13,1,2,0],[2002,'G',18,37,8,0,0],[2002,'G',33,40,2,2,0],[2002,'G',16,43,1,1,0],[2002,'G',10,27,0,1,0],[2002,'G',7,46,2,1,0],[2002,'G',23,14,2,0,0],[2002,'G',26,4,2,2,0],[2002,'G',41,34,2,0,0],[2002,'G',47,35,3,2,0],[2002,'G',13,39,1,1,0],[2002,'G',17,48,0,0,0],[2002,'G',42,33,3,1,0],[2002,'G',1,16,0,1,0],[2002,'G',23,10,1,2,0],[2002,'G',27,14,2,1,0],[2002,'G',41,47,1,1,0],[2002,'G',45,4,1,1,0],[2002,'G',35,34,4,0,0],[2002,'G',13,17,2,0,0],[2002,'G',39,48,3,3,0],[2002,'G',43,1,1,1,0],[2002,'G',40,42,2,3,0],[2002,'G',14,10,1,0,0],[2002,'G',27,23,1,1,0],[2002,'G',45,26,0,2,0],[2002,'G',34,47,3,1,0],[2002,'G',35,41,0,1,0],[2002,'R16',18,33,1,0,0],[2002,'R16',13,16,0,3,0],[2002,'R16',43,39,1,2,1],[2002,'R16',27,47,0,2,0],[2002,'R16',7,4,2,0,0],[2002,'R16',26,46,0,1,0],[2002,'R16',41,23,2,1,1],[2002,'QF',16,7,1,2,0],[2002,'QF',18,47,1,0,0],[2002,'QF',42,41,0,0,'3-5'],[2002,'QF',39,46,0,1,1],[2002,'SF',18,41,1,0,0],[2002,'SF',7,46,1,0,0],[2002,'TP',41,46,2,3,0],[2002,'F',18,7,0,2,0],[2006,'G',34,14,0,2,0],[2006,'G',16,33,1,0,0],[2006,'G',1,24,2,1,0],[2006,'G',27,21,3,1,0],[2006,'G',2,26,3,1,0],[2006,'G',47,11,0,3,0],[2006,'G',23,19,2,0,0],[2006,'G',17,44,0,0,0],[2006,'G',7,10,1,0,0],[2006,'G',45,37,2,2,0],[2006,'G',18,34,1,0,0],[2006,'G',43,33,1,0,0],[2006,'G',29,24,2,1,0],[2006,'G',35,21,2,0,0],[2006,'G',11,19,0,2,0],[2006,'G',23,47,1,1,0],[2006,'G',26,10,0,0,0],[2006,'G',7,2,2,0,0],[2006,'G',17,41,1,1,0],[2006,'G',42,45,3,1,0],[2006,'G',14,18,0,3,0],[2006,'G',43,16,2,2,0],[2006,'G',35,27,2,1,0],[2006,'G',29,1,0,0,0],[2006,'G',11,23,0,2,0],[2006,'G',19,47,2,1,0],[2006,'G',10,2,2,2,0],[2006,'G',26,7,1,4,0],[2006,'G',37,42,0,1,0],[2006,'G',44,41,2,0,0],[2006,'R16',18,43,2,0,0],[2006,'R16',1,27,2,1,1],[2006,'R16',16,14,1,0,0],[2006,'R16',35,29,1,0,0],[2006,'R16',23,2,1,0,0],[2006,'R16',7,19,3,0,0],[2006,'R16',42,17,1,3,0],[2006,'QF',18,1,1,1,'4-2'],[2006,'QF',16,35,0,0,'1-3'],[2006,'QF',7,17,0,1,0],[2006,'SF',18,23,0,2,1],[2006,'SF',35,17,0,1,0],[2006,'TP',18,35,3,1,0],[2006,'F',23,17,1,1,'5-3'],[2010,'G',40,27,1,1,0],[2010,'G',48,17,0,0,0],[2010,'G',16,47,1,1,0],[2010,'G',18,2,4,0,0],[2010,'G',29,13,2,0,0],[2010,'G',23,33,1,1,0],[2010,'G',24,35,0,0,0],[2010,'G',42,44,0,1,0],[2010,'G',40,48,0,3,0],[2010,'G',1,41,4,1,0],[2010,'G',17,27,0,2,0],[2010,'G',16,0,0,0,0],[2010,'G',29,26,1,0,0],[2010,'G',19,2,1,1,0],[2010,'G',23,30,1,1,0],[2010,'G',7,24,3,1,0],[2010,'G',17,40,1,2,0],[2010,'G',27,48,0,1,0],[2010,'G',47,0,1,0,0],[2010,'G',19,18,0,1,0],[2010,'G',33,30,0,0,0],[2010,'G',13,26,1,3,0],[2010,'G',35,7,0,0,0],[2010,'R16',48,41,2,1,0],[2010,'R16',47,19,1,2,1],[2010,'R16',18,16,4,1,0],[2010,'R16',1,27,3,1,0],[2010,'R16',33,26,0,0,'5-3'],[2010,'R16',42,35,1,0,0],[2010,'QF',29,7,2,1,0],[2010,'QF',48,19,1,1,'4-2'],[2010,'QF',1,18,0,4,0],[2010,'QF',33,42,0,1,0],[2010,'SF',48,29,2,3,0],[2010,'SF',18,42,0,1,0],[2010,'TP',48,18,2,3,0],[2010,'F',29,42,0,1,1],[2014,'G',7,10,3,1,0],[2014,'G',42,29,1,5,0],[2014,'G',16,23,1,2,0],[2014,'G',24,26,2,1,0],[2014,'G',44,14,2,1,0],[2014,'G',1,6,2,1,0],[2014,'G',18,35,4,0,0],[2014,'G',19,47,1,2,0],[2014,'G',4,0,2,1,0],[2014,'G',7,27,0,0,0],[2014,'G',2,29,2,3,0],[2014,'G',9,24,2,1,0],[2014,'G',48,16,2,1,0],[2014,'G',44,17,2,5,0],[2014,'G',1,21,1,0,0],[2014,'G',18,19,2,2,0],[2014,'G',41,0,2,4,0],[2014,'G',47,35,2,2,0],[2014,'G',2,42,0,3,0],[2014,'G',10,27,1,3,0],[2014,'G',23,48,0,1,0],[2014,'G',26,9,1,4,0],[2014,'G',6,21,3,1,0],[2014,'G',14,17,0,0,0],[2014,'G',35,19,2,1,0],[2014,'G',47,18,0,1,0],[2014,'G',41,4,0,1,0],[2014,'R16',9,48,2,0,0],[2014,'R16',29,27,2,1,0],[2014,'R16',18,0,2,1,1],[2014,'R16',1,44,1,0,1],[2014,'R16',4,47,2,1,1],[2014,'QF',17,18,0,1,0],[2014,'QF',7,9,2,1,0],[2014,'QF',1,4,1,0,0],[2014,'SF',7,18,1,7,0],[2014,'SF',29,1,0,0,'2-4'],[2014,'TP',7,29,0,3,0],[2014,'F',18,1,1,0,1],[2018,'G',15,48,0,1,0],[2018,'G',28,21,0,1,0],[2018,'G',35,42,3,3,0],[2018,'G',17,2,2,1,0],[2018,'G',18,27,0,1,0],[2018,'G',7,44,1,1,0],[2018,'G',43,41,1,0,0],[2018,'G',4,32,3,0,0],[2018,'G',45,16,1,2,0],[2018,'G',9,26,1,2,0],[2018,'G',34,39,1,2,0],[2018,'G',35,28,1,0,0],[2018,'G',48,37,1,0,0],[2018,'G',21,42,0,1,0],[2018,'G',13,2,1,1,0],[2018,'G',1,10,0,3,0],[2018,'G',4,45,5,2,0],[2018,'G',41,27,1,2,0],[2018,'G',18,43,2,1,0],[2018,'G',16,32,6,1,0],[2018,'G',26,39,2,2,0],[2018,'G',34,9,0,3,0],[2018,'G',37,15,2,1,0],[2018,'G',42,28,2,2,0],[2018,'G',21,35,1,1,0],[2018,'G',13,17,0,0,0],[2018,'G',41,18,2,0,0],[2018,'G',27,43,0,3,0],[2018,'G',26,34,0,1,0],[2018,'G',39,9,0,1,0],[2018,'G',16,4,0,1,0],[2018,'G',32,45,1,2,0],[2018,'R16',17,1,4,3,0],[2018,'R16',48,35,2,1,0],[2018,'R16',10,13,1,1,'3-2'],[2018,'R16',7,27,2,0,0],[2018,'R16',4,26,3,2,0],[2018,'R16',43,44,1,0,0],[2018,'R16',9,16,1,1,'3-4'],[2018,'QF',48,17,0,2,0],[2018,'QF',7,4,1,2,0],[2018,'QF',43,16,0,2,0],[2018,'SF',17,4,1,0,0],[2018,'SF',10,16,2,1,1],[2018,'TP',4,16,2,0,0],[2018,'F',17,10,4,2,0],[2022,'G',36,14,0,2,0],[2022,'G',16,21,6,2,0],[2022,'G',39,29,0,2,0],[2022,'G',1,37,1,2,0],[2022,'G',13,45,0,0,0],[2022,'G',27,34,0,0,0],[2022,'G',17,2,4,1,0],[2022,'G',28,10,0,0,0],[2022,'G',18,26,1,2,0],[2022,'G',4,8,1,0,0],[2022,'G',48,41,0,0,0],[2022,'G',35,19,3,2,0],[2022,'G',36,39,1,3,0],[2022,'G',29,14,1,1,0],[2022,'G',16,47,0,0,0],[2022,'G',45,2,0,1,0],[2022,'G',34,37,2,0,0],[2022,'G',17,13,2,1,0],[2022,'G',1,27,2,0,0],[2022,'G',4,28,0,2,0],[2022,'G',10,8,4,1,0],[2022,'G',42,18,1,1,0],[2022,'G',41,19,2,3,0],[2022,'G',7,44,1,0,0],[2022,'G',35,48,2,0,0],[2022,'G',14,39,1,2,0],[2022,'G',29,36,2,0,0],[2022,'G',21,47,0,1,0],[2022,'G',2,13,1,0,0],[2022,'G',45,17,1,0,0],[2022,'G',34,1,0,2,0],[2022,'G',37,27,1,2,0],[2022,'G',8,28,1,2,0],[2022,'G',10,4,0,0,0],[2022,'G',26,42,2,1,0],[2022,'G',19,48,0,2,0],[2022,'G',41,35,2,1,0],[2022,'R16',29,47,3,1,0],[2022,'R16',1,2,2,1,0],[2022,'R16',17,34,3,1,0],[2022,'R16',16,39,3,0,0],[2022,'R16',26,10,1,1,'1-3'],[2022,'R16',7,41,4,1,0],[2022,'R16',28,42,0,0,'3-0'],[2022,'R16',35,44,6,1,0],[2022,'QF',10,7,1,1,'4-2'],[2022,'QF',29,1,2,2,'3-4'],[2022,'QF',28,35,1,0,0],[2022,'QF',16,17,1,2,0],[2022,'SF',1,10,3,0,0],[2022,'SF',17,28,2,0,0],[2022,'TP',10,28,2,1,0],[2022,'F',1,17,3,3,'4-2']];
// === WCH:END ===
// Confrontos de Copas entre a e b: lista (ano desc) + retrospecto do ponto de vista de a.
// Empate decidido nos pênaltis conta como EMPATE no retrospecto (o jogo terminou empatado).
const wcH2H = (a, b) => {
  const ia = WCH_TEAMS.indexOf(a), ib = WCH_TEAMS.indexOf(b);
  const out = { matches: [], tally: { wA: 0, d: 0, wB: 0 } };
  if (ia < 0 || ib < 0 || a === b) return out;
  for (const r of WCH) {
    const [y, st, h, aw, gh, ga, pen, rep] = r;
    if (!((h === ia && aw === ib) || (h === ib && aw === ia))) continue;
    out.matches.push({ y, st, h: WCH_TEAMS[h], a: WCH_TEAMS[aw], gh, ga, pen: pen || 0, rep: !!rep });
    const gFor = h === ia ? gh : ga, gAg = h === ia ? ga : gh;
    if (gFor > gAg) out.tally.wA++; else if (gFor < gAg) out.tally.wB++; else out.tally.d++;
  }
  out.matches.sort((x, y2) => y2.y - x.y);
  return out;
};

// Persistência local (localStorage) — sobrevive a fechar/reabrir o navegador.
// Seguro: se o storage não estiver disponível (ex.: preview), degrada sem quebrar.
// ============================================================================
const LS_PREFIX = 'wc2026_';
const lsLoad = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(LS_PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) { return fallback; }
};
const lsSave = (key, value) => {
  try { window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch (e) { /* sem storage: ignora */ }
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function WC2026() {
  const [tab, setTab] = useState('groups');
  const [nSim, setNSim] = useState(() => lsLoad('nSim', 10000));
  const [running, setRunning] = useState(false);
  const [mcProg, setMcProg] = useState(null); // % do MC em blocos (null = parado)
  const [mcErr, setMcErr] = useState(null); // erro da última simulação (banner)
  const mcAbortRef = useRef(false); // pedido de cancelamento entre chunks
  const [res, setRes] = useState(null);
  const [appliedKey, setAppliedKey] = useState(null); // assinatura dos resultados já incorporados ao último MC
  const [baseAgg, setBaseAgg] = useState(null); // agregado pré-Copa (zero resultados) p/ indicadores Δ
  const [g3p, setG3p] = useState(null);
  const [muPct, setMuPct] = useState(null);
  const [comboList, setComboList] = useState(null);
  const [tmPct, setTmPct] = useState(null);
  const [posMu, setPosMu] = useState(null);
  const [posTm, setPosTm] = useState(null);
  const [posWho, setPosWho] = useState(null);
  const [tmPosData, setTmPosData] = useState(null); // team vs opp position
  const [posVsTmData, setPosVsTmData] = useState(null);
  const [matchTmData, setMatchTmData] = useState(null);
  const [matchWhoData, setMatchWhoData] = useState(null);
  const [matchWinData, setMatchWinData] = useState(null); // matchWin[mn] = {team: cnt vitórias}
  const [matchPosData, setMatchPosData] = useState(null);
  const [duelPosData, setDuelPosData] = useState(null);
  const [duelExpand, setDuelExpand] = useState(null); // round name when expanded
  const [liveCard, setLiveCard] = useState(null); // idx of GS card expanded for in-game calc
  const [liveInputs, setLiveInputs] = useState({}); // { [idx]: { tau, gA, gB, redsA, redsB, s1, s2, csA, csB, ev } }
  const [evForm, setEvForm] = useState({ t: 'g', s: 'A', m: '' }); // editor de evento minutado do card ao vivo aberto
  const [koHist, setKoHist] = useState(null); // mn do card KO com histórico de Copas aberto
  const [clsOpen, setClsOpen] = useState(null); // idx do jogo GS com a tabela de classificação antes→agora aberta
  const [clsMetric, setClsMetric] = useState('class'); // métrica observada na tabela de impacto: class|p1..p4|pts|gf|gd
  const [preOpen, setPreOpen] = useState(null); // idx do jogo GS (ainda sem placar) com o "E se?" pré-jogo aberto
  const [bracketSel, setBracketSel] = useState(null); // {type:'match',mn} | {type:'group',gn} | null — painel de detalhe do bracket
  const [selCombo, setSelCombo] = useState(null); // combinação de 3ºs fixada manualmente (null = automática, a mais provável)
  const [surSort, setSurSort] = useState('bits'); // ordenação da aba Surpresas: 'bits' | 'impact'
  const [surModels, setSurModels] = useState(false); // mostra a comparação de modelos (backtest) dentro da aba Surpresas
  const [bsShowAll, setBsShowAll] = useState(false); // mostra todos os 48 modelos do backtest (em vez do top 20)
  const [confedNoIntra, setConfedNoIntra] = useState(false); // ignora confrontos intra-confederação (ex. UEFA×UEFA)
  const [confedSort, setConfedSort] = useState('aprov'); // ordenação da aba Confederações
  const [surExpand, setSurExpand] = useState(null); // resKey expandida (movers) na aba Surpresas
  const [evoData, setEvoData] = useState(null); // evolution snapshots
  const [evoTeams, setEvoTeams] = useState(['Brazil','Argentina','Spain','France']);
  const [evoMetric, setEvoMetric] = useState('ch');
  const [evoView, setEvoView] = useState('chart'); // 'chart' | 'models'
  const [bsData, setBsData] = useState(null); // resultado do backtest de modelos
  const [bsLoading, setBsLoading] = useState(false);
  const [evoLoading, setEvoLoading] = useState(false);
  const [evoFilterTeam, setEvoFilterTeam] = useState(''); // '' = todos os jogos; nome do time = só jogos dele
  const [evoGrp, setEvoGrp] = useState('A'); // grupo da tabela de evolução (Cruzamentos▸Evolução)
  const [evoTblMetric, setEvoTblMetric] = useState('adv'); // métrica da tabela de evolução
  const [evoTblLoading, setEvoTblLoading] = useState(false);
  const [evoAll, setEvoAll] = useState({}); // { gn: tbl } — pré-preenchido p/ os 12 grupos após o MC
  const [evoAllProg, setEvoAllProg] = useState(null); // { done, total } enquanto pré-calcula em segundo plano
  const [tpcData, setTpcData] = useState(null); // position-conditioned matchups
  const [matchByG3Data, setMatchByG3Data] = useState(null); // g3-filtered match data
  const [matchChampData, setMatchChampData] = useState(null);
  const [gsShiftData, setGsShiftData] = useState(null);
  const [koShiftData, setKoShiftData] = useState(null);
  const [cutoff3rdData, setCutoff3rdData] = useState(null);
  const [scoreDistData, setScoreDistData] = useState(null);
  const [tieAccData, setTieAccData] = useState(null);
  const [recAdvData, setRecAdvData] = useState(null);
  const [selMatch, setSelMatch] = useState(73);
  const [g3filter, setG3filter] = useState({});
  const [gamePos, setGamePos] = useState(''); // '' = all positions, 'I1' = specific position
  const [resView, setResView] = useState('games');
  const [resGrp, setResGrp] = useState('all'); // filtro por grupo na view ⚽ Jogos ('all' | 'A'..'L')
  const [resStat, setResStat] = useState('mode'); // 'mode' | 'median' | 'mean' para o placar de referência nos cards
  const [grpView, setGrpView] = useState('');
  const [grpStat, setGrpStat] = useState('mean'); // 'mean' | 'median' para pts/gols na view Por Grupo
  const [grpWDL, setGrpWDL] = useState(false); // mostrar colunas V/E/D na view Por Grupo
  const [eloPhase, setEloPhase] = useState('all');
  const [scFilter, setScFilter] = useState('all');
  const [probsView, setProbsView] = useState('bracket'); // 'table' | 'group' // 'games' | 'standings' | 'forced'
  const [selPos, setSelPos] = useState('C1');
  const [posMode, setPosMode] = useState('pos'); // 'pos' or 'team' -- show opponents as positions or teams
  const [tmMode, setTmMode] = useState('team');
  const [condMode, setCondMode] = useState(false);
  const [venueMode, setVenueMode] = useState('pair'); // 'pair', 'team', or 'pos'
  const [single, setSingle] = useState(null);
  const [pc, setPc] = useState(() => lsLoad('pc', {UEFA_A:0,UEFA_B:0,UEFA_C:0,UEFA_D:0,IC1:0,IC2:0}));
  const [phase, setPhase] = useState('bracket');
  const [muRound, setMuRound] = useState('r32');
  const [selTeam, setSelTeam] = useState('Brazil');
  const [muView, setMuView] = useState('round');
  const [confA, setConfA] = useState('Brazil');
  const [confB, setConfB] = useState('Argentina');
  const [confKO, setConfKO] = useState(false);
  const [confExp, setConfExp] = useState({}); // {reg,marg,et,pen} → expandir listas de placares
  const [userRes, setUserRes] = useState(() => {
    const init = {};
    Object.entries(BUILT_IN_RESULTS).forEach(([k, v]) => {
      if (k.startsWith('k')) init[k] = { ...v }; // mata-mata key stays as 'kNN'
      else { const idx = (+k) - 1; if (idx >= 0 && idx < GS.length) init[idx] = { ...v }; }
    });
    // Resultados salvos localmente sobrepõem (e complementam) os fixos no código.
    const saved = lsLoad('userRes', null);
    return saved && typeof saved === 'object' ? { ...init, ...saved } : init;
  });
  const [conditions, setConditions] = useState([]); // [{team, type, target?, round?}] — filtro condicional (AND)
  const [condForm, setCondForm] = useState({ team: 'Brazil', type: 'champ', target: 'Argentina', round: 'any' });
  const [mcMeta, setMcMeta] = useState(null); // { nAccepted, n, conds } da última rodada
  const [rSys, setRSys] = useState(() => lsLoad('rSys', 'elo'));
  const [useTilt, setUseTilt] = useState(() => lsLoad('useTilt', true));
  const [customElo, setCustomElo] = useState(() => lsLoad('customElo', {}));
  const [customME, setCustomME] = useState(() => lsLoad('customME', 1.32));
  const [favWeight, setFavWeight] = useState(() => lsLoad('favWeight', 1));
  const [spread, setSpread] = useState(() => lsLoad('spread', true));
  const [injuries, setInjuries] = useState(() => lsLoad('injuries', {})); // { team: nº de lesões }
  const [homeAdv, setHomeAdv] = useState(() => lsLoad('homeAdv', 70));
  const [dynElo, setDynElo] = useState(() => lsLoad('dynElo', false)); // Elo dinâmico: atualiza a força pelos resultados já disputados (camada opcional)

  const groups = useMemo(() => rG(pc), [pc]);
  const all = useMemo(() => Object.values(groups).flat(), [groups]);

  // Pool de simulações da última rodada do MC — permite re-filtrar em memória sem re-simular.
  const poolRef = useRef(null);

  // Aplica um resultado agregado (de runMC ou reaggregate) em todos os estados das abas.
  const applyAgg = (r) => {
    setRes(r.p); setG3p(r.g3p); setMuPct(r.muPct); setComboList(r.comboList); setTmPct(r.tmPct); setPosMu(r.posMu); setPosTm(r.posTm); setPosWho(r.posWho); setTmPosData(r.tmPos); setPosVsTmData(r.posVsTm); setMatchTmData(r.matchTm); setMatchWhoData(r.matchWho); setMatchWinData(r.matchWin); setMatchPosData(r.matchPos); setDuelPosData(r.duelPos); setTpcData(r.tpc); setMatchByG3Data(r.matchByG3); setMatchChampData(r.matchChamp); setGsShiftData(r.gsShift); setKoShiftData(r.koShift); setCutoff3rdData(r.cutoff3rd); setScoreDistData(r.scoreDist); setTieAccData(r.tieAcc); setRecAdvData(r.recAdv);
  };

  // MC em BLOCOS: nunca bloqueia a UI por mais de ~um chunk (importante em 100k+ sims).
  // Progresso percentual visível, cancelável, e try/catch que aborta limpo em erro.
  const cancelMC = () => { mcAbortRef.current = true; };
  // Assinatura canônica dos resultados preenchidos — compara o que está digitado vs o que já foi simulado.
  const urKey = (ur) => Object.keys(ur || {}).filter(k => ur[k] && ur[k].gA != null && ur[k].gB != null).sort().map(k => `${k}:${ur[k].gA}-${ur[k].gB}${ur[k].pw ? 'p' + ur[k].pw : ''}`).join(';');
  // Assinatura do MODELO (não inclui resultados): muda → recalcula a baseline pré-Copa.
  const modelKey = () => JSON.stringify([rSys, useTilt, favWeight, spread, homeAdv, injuries, customElo, customME, dynElo]);
  const baseKeyRef = useRef(null);
  // Baseline pré-Copa (zero resultados): referência fixa "início da Copa" p/ os Δ das sub-abas.
  // Roda SEM ajuste dinâmico de Elo (o dynElo é uma camada que entra só no res principal),
  // com N limitado (indicador, não precisa da mesma precisão do MC principal).
  const computeBaseline = () => {
    try {
      _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
      const svDyn = _dynAdj; _dynAdj = {}; // baseline ignora o Elo dinâmico
      const NB = Math.min(Math.max(100, Math.floor(+nSim) || 10000), 30000);
      const r = runMC(groups, NB, {}, []);
      _dynAdj = svDyn; // restaura p/ render (rt) e demais cálculos seguirem com o ajuste vigente
      setBaseAgg({ p: r.p, g3p: r.g3p, muPct: r.muPct, comboList: r.comboList, tmPct: r.tmPct, posMu: r.posMu, matchTm: r.matchTm, posTm: r.posTm, posVsTm: r.posVsTm, cutoff3rd: r.cutoff3rd, tpc: r.tpc, matchWho: r.matchWho, n: NB });
    } catch (err) { /* baseline é só indicador; falha não quebra o app */ }
  };
  const maybeBaseline = () => { const mk = modelKey(); if (baseKeyRef.current !== mk) { baseKeyRef.current = mk; computeBaseline(); } };
  // Agenda trabalho pesado para DEPOIS da primeira pintura (não trava a tela após o run).
  const afterPaint = (fn) => { requestAnimationFrame(() => { if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 800 }); else setTimeout(fn, 300); }); };
  const doMC = () => {
    const runKey = urKey(userRes); // resultados que ESTE MC vai incorporar
    if (running) return; // já rodando (efeitos automáticos não cancelam nem empilham)
    const N = Math.max(100, Math.floor(+nSim) || 10000); // tolera campo vazio/inválido; sem teto superior
    // Elo dinâmico: calcula o ajuste uma vez (depende dos globais de modelo) e reaplica a cada chunk.
    _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
    const dynAdj = dynElo ? computeDynAdj(groups, userRes, DYN_K) : {};
    setRunning(true); setMcProg(0); setMcErr(null);
    mcAbortRef.current = false;
    const pool = new Array(N);
    const CHUNK = 2500;
    let i = 0;
    const step = () => {
      try {
        if (mcAbortRef.current) { setRunning(false); setMcProg(null); return; } // cancelado: mantém o universo anterior
        // re-sincroniza os globais a cada chunk (outras interações podem rodar entre eles)
        _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv; _dynAdj = dynAdj;
        const end = Math.min(N, i + CHUNK);
        for (; i < end; i++) pool[i] = runSim(groups, userRes);
        if (i < N) { setMcProg(Math.round(i / N * 100)); setTimeout(step, 0); return; }
        setMcProg(100); // pinta 100% antes da agregação (que é um bloco único, ~1s em 250k)
        setTimeout(() => {
          try {
            const all0 = Object.values(groups).flat();
            const r = { ...aggregate(pool, all0, groups, conditions), n: N, pool, all: all0 };
            poolRef.current = { pool: r.pool, all: r.all, groups }; // guarda o universo para re-filtragem instantânea
            applyAgg(r);
            setAppliedKey(runKey); // resultados agora incorporados — limpa o "não aplicado"
            setMcMeta({ nAccepted: r.nAccepted, n: r.n, conds: conditions });
            setRunning(false); setMcProg(null); setTab('probs');
            // Baseline pré-Copa (Δ) só DEPOIS da tela pintar — evita a lentidão pós-run.
            // A Evolução NÃO roda aqui: é calculada sob demanda por botão na própria aba.
            afterPaint(maybeBaseline);
          } catch (err) { setRunning(false); setMcProg(null); setMcErr('Falha ao agregar a simulação: ' + (err?.message || err)); }
        }, 0);
      } catch (err) {
        setRunning(false); setMcProg(null);
        setMcErr('Falha na simulação (' + i.toLocaleString() + '/' + N.toLocaleString() + '): ' + (err?.message || err));
      }
    };
    setTimeout(step, 30);
  };

  // Re-filtra o pool existente sob as condições atuais — instantâneo, sem re-simular, sem ruído.
  const applyFilter = (conds) => {
    const pr = poolRef.current;
    if (!pr || !pr.pool) { doMC(); return; } // sem pool ainda: cai no MC normal
    const r = reaggregate(pr.pool, pr.all, pr.groups, conds);
    applyAgg(r);
    setMcMeta({ nAccepted: r.nAccepted, n: r.n, conds });
  };

  const doSingle = () => { _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv; setSingle(runSim(groups, userRes)); setTab('single'); };
  // Resultados digitados ainda não incorporados ao MC exibido (só vale depois da 1ª rodada).
  const resultsDirty = res != null && appliedKey != null && urKey(userRes) !== appliedKey;
  // ── Indicadores Δ "desde o início da Copa" (vs baseline pré-Copa) ────────────
  const baseN = baseAgg?.n; // nº de sims da baseline (denominador próprio)
  // Δ em pontos percentuais; cur/base já em %. Mostra só fora do modo condicional.
  const dTag = (cur, base) => {
    if (base == null || !Number.isFinite(base) || !Number.isFinite(cur)) return null;
    const d = cur - base;
    if (Math.abs(d) < 0.1) return <span style={{ fontSize: '8px', color: dm, marginLeft: '3px', opacity: 0.6 }} title={`início da Copa: ${base.toFixed(1)}%`}>±0</span>;
    return <span style={{ fontSize: '8px', fontWeight: 700, marginLeft: '3px', color: d > 0 ? gn : rd }} title={`início da Copa: ${base.toFixed(1)}% → agora: ${cur.toFixed(1)}% (Δ desde o início)`}>{d > 0 ? '▲' : '▼'}{Math.abs(d).toFixed(1)}</span>;
  };
  // Busca o % da baseline para o mesmo par (lista [{a,b,pct}], ordem indiferente).
  const basePairPct = (list, a, b) => { if (!list) return null; const m = list.find(x => (x.a === a && x.b === b) || (x.a === b && x.b === a)); return m ? m.pct : 0; };
  // Busca o % da baseline para uma combinação de 3ºs (lista [{key,pct}]).
  const baseComboPct = (key) => { if (!baseAgg?.comboList) return null; const m = baseAgg.comboList.find(c => c.key === key); return m ? m.pct : 0; };

  // ── Resumo por confederação (aba Cruzamentos ▸ Confederações) ───────────────
  // Sobre TODOS os jogos já disputados (GS + mata-mata). Usa o Elo INICIAL (rtRaw, sem
  // ajuste dinâmico) para a expectativa; Elo ± é o ajuste acumulado (mesma conta do Elo
  // dinâmico, K fixo); Δ pts = pontos reais − esperados (modelo de gols com tilt/spread/fav).
  const CONFED_LIST = ['UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'];
  const confedStats = useMemo(() => {
    const sv = { dyn: _dynAdj, inj: _injM };
    try {
      _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _hb = homeAdv; _injM = {}; _dynAdj = {};
      const st = {}; CONFED_LIST.forEach(c => st[c] = { conf: c, n: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, elo: 0, dPts: 0, eloOrig: 0, nTeams: 0 });
      all.forEach(t => { const c = CF[t]; if (st[c]) { st[c].eloOrig += rtRaw(t); st[c].nTeams++; } });
      const acc = (team, opp, eFor, eAg, gF, gA) => {
        const c = CF[team]; if (!st[c]) return;
        if (confedNoIntra && CF[opp] === c) return; // ignora confronto intra-confederação
        const s = st[c];
        s.n++; s.gf += gF; s.ga += gA;
        const r = gF > gA ? 1 : gF < gA ? 0 : 0.5;
        if (r === 1) s.w++; else if (r === 0.5) s.d++; else s.l++;
        const exp = 1 / (1 + Math.pow(10, (eAg - eFor) / 400));
        s.elo += DYN_K * (r - exp);
        const pr = mProbs(eFor, eAg, team, opp);
        s.dPts += (r === 1 ? 3 : r === 0.5 ? 1 : 0) - (3 * pr.pH / 100 + 1 * pr.pD / 100);
      };
      GS.forEach(([gn, hi, ai, date, city], idx) => {
        const rr = userRes[idx]; if (!rr || rr.gA == null || rr.gB == null) return;
        const h = groups[gn][hi], a = groups[gn][ai];
        const eH = efCity(h, city), eA = efCity(a, city);
        acc(h, a, eH, eA, rr.gA, rr.gB); acc(a, h, eA, eH, rr.gB, rr.gA);
      });
      try {
        const ko = resolveKO(resolveStandings(groups, userRes), userRes);
        for (let mn = 73; mn <= 104; mn++) {
          const rr = userRes['k' + mn]; if (!rr || rr.gA == null || rr.gB == null) continue;
          const m = ko[mn]; if (!m || !m.h || !m.a) continue;
          const eH = mn <= 88 ? ef(m.h) : efCity(m.h, KO_CITY[mn]);
          const eA = mn <= 88 ? ef(m.a) : efCity(m.a, KO_CITY[mn]);
          acc(m.h, m.a, eH, eA, rr.gA, rr.gB); acc(m.a, m.h, eA, eH, rr.gB, rr.gA);
        }
      } catch (e) { /* bracket ainda não resolvível: ignora o mata-mata */ }
      CONFED_LIST.forEach(c => { const s = st[c]; s.eloOrig = s.nTeams ? Math.round(s.eloOrig / s.nTeams) : 0; s.aprov = s.n ? (3 * s.w + s.d) / (3 * s.n) * 100 : null; });
      return CONFED_LIST.map(c => st[c]).filter(s => s.nTeams > 0);
    } finally { _dynAdj = sv.dyn; _injM = sv.inj; }
  }, [userRes, rSys, customElo, customME, useTilt, favWeight, spread, homeAdv, groups, pc, all, confedNoIntra]);

  // ── Impacto instantâneo: Δ chance de classificação (GS) / de avanço (KO) ────
  // GS: pares de mini-MCs SÓ do grupo (6 jogos) com sementes idênticas (CRN) —
  // determinístico, ~dezenas de ms, sem fila. KO: analítico puro (koAdvProb).
  // Sempre incondicional (ignora filtros).
  const IMPACT_N = 10000, IMPACT_SEED = 0x5EED;
  // Map novo a cada mudança de inputs — useMemo roda DURANTE o render (sem frame stale).
  const impactCache = useMemo(() => new Map(), [userRes, injuries, rSys, customME, useTilt, favWeight, spread, homeAdv, pc, customElo]);
  // Monta os 6 jogos de um grupo (Elo com cidade e lesões) sob um conjunto de resultados.
  const mkGroupGames = (gn, teams, ur) => GS.map(([g, hi, ai, date, city], k) => {
    if (g !== gn) return null;
    const h = teams[hi], a = teams[ai], im = injuries[k] || {};
    const fx = ur[k]?.gA != null && ur[k]?.gB != null ? { gA: ur[k].gA, gB: ur[k].gB } : null;
    return { key: k, h, a, eH: efCity(h, city) - (im.h || 0) * INJ_ELO, eA: efCity(a, city) - (im.a || 0) * INJ_ELO, fx };
  }).filter(Boolean);
  // Mini-MC do grupo com cache por CENÁRIO (mesmos placares fixados → mesma entrada).
  const runGroupCached = (gn, teams, games) => {
    const ck = gn + '|' + games.map(g => g.fx ? `${g.key}:${g.fx.gA}-${g.fx.gB}` : g.key).join(';');
    if (!impactCache.has(ck)) impactCache.set(ck, groupPosProbs(games, teams, gn, IMPACT_N, IMPACT_SEED));
    return impactCache.get(ck);
  };
  const qP3 = (gn) => g3p?.[gn] != null ? g3p[gn] / 100 : 8 / 12; // P(3º do grupo avançar) — leitura, cache independe do MC
  const qualImpact = (resKey) => {
    _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
    if (String(resKey).startsWith('k')) {
      const mn = +String(resKey).slice(1);
      const m = resolveKO(resolveStandings(groups, userRes), userRes)[mn];
      if (!m?.h || !m?.a || !m.winner) return null;
      const eH = mn <= 88 ? ef(m.h) : efCity(m.h, KO_CITY[mn]); // espelha o runSim: R32 neutro (mk), R16+ com cidade (mko)
      const eA = mn <= 88 ? ef(m.a) : efCity(m.a, KO_CITY[mn]);
      const { pAdvA } = koAdvProb(eH, eA, m.h, m.a);
      const pW = (m.winner === m.h ? pAdvA : 1 - pAdvA) * 100;
      return { type: 'ko', mn, winner: m.winner, loser: m.winner === m.h ? m.a : m.h, pAdvW: pW, dW: 100 - pW };
    }
    const idx = +resKey, gn = GS[idx][0], teams = groups[gn];
    if (userRes[idx]?.gA == null || userRes[idx]?.gB == null) return null;
    const wC = runGroupCached(gn, teams, mkGroupGames(gn, teams, userRes));
    const urMinus = { ...userRes }; delete urMinus[idx];
    const oC = runGroupCached(gn, teams, mkGroupGames(gn, teams, urMinus));
    const q = qP3(gn);
    const movers = teams.map(t => {
      const d = [0, 1, 2, 3].map(p => (wC[t].pos[p] - oC[t].pos[p]) / IMPACT_N * 100);
      return { t, dP1: d[0], dP2: d[1], dP3: d[2], dP4: d[3], dAdv: d[0] + d[1] + q * d[2] };
    }).sort((x, y) => Math.abs(y.dAdv) - Math.abs(x.dAdv));
    return { type: 'gs', gn, q, n: IMPACT_N, movers, headline: movers[0] };
  };
  // Métricas observáveis no impacto da aba Resultados (antes → agora).
  const IMPACT_METRICS = {
    class: { label: 'Classificar', pct: true, fn: (st, q) => (st.pos[0] + st.pos[1] + q * st.pos[2]) / IMPACT_N * 100 },
    p1: { label: '1º lugar', pct: true, fn: st => st.pos[0] / IMPACT_N * 100 },
    p2: { label: '2º lugar', pct: true, fn: st => st.pos[1] / IMPACT_N * 100 },
    p3: { label: '3º lugar', pct: true, fn: st => st.pos[2] / IMPACT_N * 100 },
    p4: { label: '4º lugar', pct: true, fn: st => st.pos[3] / IMPACT_N * 100 },
    pts: { label: 'Pontos', pct: false, unit: 'pts', fn: st => st.pts / IMPACT_N },
    gf: { label: 'Gols marcados', pct: false, unit: 'gols', fn: st => st.gf / IMPACT_N },
    gd: { label: 'Saldo de gols', pct: false, unit: '', signed: true, fn: st => st.gd / IMPACT_N },
  };
  // Expectativa de classificação dos times do grupo ANTES do jogo idx vs SE ELE TERMINAR gA×gB.
  // Usado no card ao vivo (placar corrente). "Antes" = demais resultados do grupo mantidos, este jogo livre.
  const qualShift = (idx, gA, gB) => {
    _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
    const gn = GS[idx][0], teams = groups[gn];
    const urMinus = { ...userRes }; delete urMinus[idx];
    const oC = runGroupCached(gn, teams, mkGroupGames(gn, teams, urMinus));
    const wC = runGroupCached(gn, teams, mkGroupGames(gn, teams, { ...urMinus, [idx]: { gA, gB } }));
    const q = qP3(gn);
    // P(o 3º colocado do grupo avançar): condicionada pelo MC COMPLETO, que enxerga o corte
    // entre-grupos (8 melhores 3ºs de 12). agora = res (todos os resultados); início = baseline pré-Copa.
    // Σ_t g3a / Σ_t (g3a+g3o) sobre os times do grupo = fração das sims em que o 3º do grupo avançou.
    const grpThird = (agg) => { if (!agg) return null; let a = 0, o = 0; teams.forEach(t => { a += agg[t]?.g3a || 0; o += agg[t]?.g3o || 0; }); return (a + o) > 0 ? (a / (a + o)) * 100 : null; };
    const thirdNow = grpThird(res), thirdIni = grpThird(baseAgg?.p);
    // rows com before/after por time para a métrica escolhida (fn do IMPACT_METRICS)
    const rowsFor = fn => teams.map(t => ({ t, before: fn(oC[t], q), after: fn(wC[t], q) }));
    return { gn, q, rowsFor, third: { before: thirdIni, after: thirdNow, hasMC: thirdNow != null } };
  };
  // Tabela "expectativa de classificação antes → agora" dos 4 times do grupo, dado que
  // o jogo idx termina gA×gB. highlight = times a destacar (os que jogaram). Reusada
  // no card ao vivo (placar corrente) e no card de jogo já finalizado (placar fixado).
  const classTable = (idx, gA, gB, highlight) => {
    const sh = qualShift(idx, gA, gB);
    const M = IMPACT_METRICS[clsMetric];
    const ordered = sh.rowsFor(M.fn).slice().sort((x, y) => y.after - x.after);
    const fmt = v => M.pct ? v.toFixed(0) + '%' : (M.signed && v > 0 ? '+' : '') + v.toFixed(1);
    const fmtD = d => (d > 0 ? '+' : '') + (M.pct ? d.toFixed(0) + ' p.p.' : d.toFixed(1) + (M.unit ? ' ' + M.unit : ''));
    const thr = M.pct ? 0.5 : 0.05; // limiar p/ colorir o Δ
    return (
      <div style={{ marginTop: '6px', padding: '6px 8px', background: card, borderRadius: '4px', border: `1px solid ${bd}` }}>
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '5px' }}>
          {Object.entries(IMPACT_METRICS).map(([k, m]) => (
            <button key={k} onClick={() => setClsMetric(k)} style={{ padding: '1px 6px', fontSize: '8px', fontWeight: clsMetric === k ? 700 : 400, background: clsMetric === k ? `${acc}33` : 'transparent', color: clsMetric === k ? acc : dm, border: `1px solid ${clsMetric === k ? acc : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{m.label}</button>
          ))}
        </div>
        <div style={{ fontSize: '8px', color: dm, marginBottom: '4px' }}>{M.pct ? (clsMetric === 'class' ? <>Chance de <strong style={{ color: tx }}>classificação</strong> (1º+2º+{(sh.q * 100).toFixed(0)}%·3º)</> : <>Chance de terminar em <strong style={{ color: tx }}>{M.label}</strong></>) : <>Expectativa de <strong style={{ color: tx }}>{M.label.toLowerCase()}</strong></>} no Grupo {sh.gn} com este jogo <strong style={{ color: tx }}>{gA}–{gB}</strong> (antes deste jogo → agora).</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 14px 52px 60px', gap: '4px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 0 2px', borderBottom: `1px solid ${bd}` }}>
          <span>Time</span><span style={{ textAlign: 'right' }}>antes</span><span /><span style={{ textAlign: 'right' }}>agora</span><span style={{ textAlign: 'right' }}>Δ</span>
        </div>
        {ordered.map(r => {
          const on = highlight.includes(r.t);
          const d = r.after - r.before;
          return (
            <div key={r.t} style={{ display: 'grid', gridTemplateColumns: '1fr 52px 14px 52px 60px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '1px 0', opacity: on ? 1 : 0.6 }}>
              <span style={{ fontWeight: on ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl(r.t)} {nm(r.t)}</span>
              <span style={{ textAlign: 'right', color: dm }}>{fmt(r.before)}</span>
              <span style={{ textAlign: 'center', color: dm }}>→</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: M.pct ? (r.after > 60 ? gn : r.after > 30 ? acc : tx) : tx }}>{fmt(r.after)}</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: d > thr ? gn : d < -thr ? rd : dm }}>{fmtD(d)}</span>
            </div>
          );
        })}
        {clsMetric === 'class' && sh.third.hasMC && (() => {
          const hasBefore = sh.third.before != null;
          const d3 = hasBefore ? sh.third.after - sh.third.before : null;
          return (
            <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: `1px solid ${bd}`, display: 'grid', gridTemplateColumns: '1fr 52px 14px 52px 60px', gap: '4px', alignItems: 'center', fontSize: '9px' }} title="Chance de o time que terminar em 3º neste grupo entrar na repescagem dos 8 melhores 3ºs — condicionada pelo MC COMPLETO, que enxerga o corte entre todos os 12 grupos (o mini-MC de um grupo não enxergaria). Referência: início da Copa (sem resultados) → agora (com todos os resultados aplicados), não apenas este jogo.">
              <span style={{ color: bl, fontWeight: 600 }}>3º do grupo avança <span style={{ color: dm, fontWeight: 400, fontSize: '8px' }}>(início→agora)</span></span>
              <span style={{ textAlign: 'right', color: dm }}>{hasBefore ? sh.third.before.toFixed(0) + '%' : '—'}</span>
              <span style={{ textAlign: 'center', color: dm }}>→</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: bl }}>{sh.third.after.toFixed(0)}%</span>
              <span style={{ textAlign: 'right', fontWeight: 700, color: d3 == null ? dm : d3 > 0.5 ? gn : d3 < -0.5 ? rd : dm }}>{d3 == null ? '' : (d3 > 0 ? '+' : '') + d3.toFixed(0) + ' p.p.'}</span>
            </div>
          );
        })()}
      </div>
    );
  };
  // Pré-jogo (jogo ainda sem placar): impacto POTENCIAL de cada desfecho na classificação
  // dos dois times — agora → se V mandante (1–0) / empate (1–1) / V visitante (0–1).
  const preGamePreview = (idx, home, away) => {
    const fn = IMPACT_METRICS.class.fn;
    const sc = { h: qualShift(idx, 1, 0), d: qualShift(idx, 1, 1), a: qualShift(idx, 0, 1) };
    const rowsH = sc.h.rowsFor(fn); // "antes" é idêntico nos três (mesmo urMinus)
    const before = t => (rowsH.find(r => r.t === t) || {}).before || 0;
    const after = (k, t) => (sc[k].rowsFor(fn).find(r => r.t === t) || {}).after || 0;
    const cols = [['h', `V ${nm(home).slice(0, 3).toUpperCase()}`, '1–0', gn], ['d', 'Empate', '1–1', dm], ['a', `V ${nm(away).slice(0, 3).toUpperCase()}`, '0–1', bl]];
    return (
      <div style={{ marginTop: '4px', padding: '6px 8px', background: card, borderRadius: '4px', border: `1px solid ${bd}` }}>
        <div style={{ fontSize: '8px', color: dm, marginBottom: '4px' }}>🔮 Impacto potencial na <strong style={{ color: tx }}>classificação</strong> (Grupo {sc.h.gn}) — agora → se o jogo terminar em cada desfecho (placar representativo).</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 46px 64px 64px 64px', gap: '4px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 0 2px', borderBottom: `1px solid ${bd}` }}>
          <span>Time</span><span style={{ textAlign: 'right' }}>agora</span>{cols.map(([k, lbl, , c]) => <span key={k} style={{ textAlign: 'right', color: c }} title={`placar representativo ${cols.find(x => x[0] === k)[2]}`}>{lbl}</span>)}
        </div>
        {[home, away].map(t => (
          <div key={t} style={{ display: 'grid', gridTemplateColumns: '1fr 46px 64px 64px 64px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '1px 0' }}>
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl(t)} {nm(t)}</span>
            <span style={{ textAlign: 'right', color: dm }}>{before(t).toFixed(0)}%</span>
            {cols.map(([k]) => { const a = after(k, t), d = a - before(t); return (
              <span key={k} style={{ textAlign: 'right', fontWeight: 700, color: a > 60 ? gn : a > 30 ? acc : tx }}>{a.toFixed(0)}% <span style={{ fontSize: '8px', fontWeight: 600, color: d > 0.5 ? gn : d < -0.5 ? rd : dm }}>{d > 0 ? '+' : ''}{d.toFixed(0)}</span></span>
            ); })}
          </div>
        ))}
      </div>
    );
  };

  // Tabela de evolução por grupo (Cruzamentos▸Evolução): roda o MC completo em snapshots,
  // adicionando os jogos do grupo um a um (demais resultados mantidos), e registra por time
  // as chances de posição (1º..4º, avança) e de fase do mata-mata (R16..Campeão).
  const EVO_METRICS = [['adv', 'Avança'], ['p1', '1º'], ['p2', '2º'], ['p3', '3º'], ['p4', '4º'], ['r16', 'R16'], ['qf', 'QF'], ['sf', 'SF'], ['fin', 'Final'], ['ch', 'Campeão']];
  // Núcleo síncrono: calcula a tabela de evolução de UM grupo (snapshots jogo a jogo).
  // Respeita o Elo dinâmico — cada snapshot recalcula o ajuste a partir dos seus resultados.
  const buildGroupEvo = (gnArg) => {
    _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
    const gIdxs = [];
    GS.forEach((row, i) => { if (row[0] === gnArg) gIdxs.push(i); });
    gIdxs.sort((a, b) => dateKey(GS[a][3]) - dateKey(GS[b][3]) || GS_BRT[a].localeCompare(GS_BRT[b]));
    const filled = gIdxs.filter(i => userRes[i]?.gA != null && userRes[i]?.gB != null);
    const base = { ...userRes }; gIdxs.forEach(i => delete base[i]); // tira os jogos do grupo; adiciona um a um
    const snaps = [{ label: 'Início', idx: null, ur: { ...base } }];
    let acc = { ...base };
    filled.forEach((i) => { acc = { ...acc, [i]: userRes[i] }; snaps.push({ label: 'M' + (i + 1), idx: i, ur: { ...acc } }); });
    const sims = Math.max(500, Math.min(3000, Math.floor((+nSim || 10000) / 3)));
    const teams = groups[gnArg];
    const data = snaps.map(s => {
      _dynAdj = dynElo ? computeDynAdj(groups, s.ur, DYN_K) : {};
      const r = runMC(groups, sims, s.ur, []);
      const probs = {};
      teams.forEach(t => { const p = r.p[t] || {}; probs[t] = { adv: (p.g1 || 0) + (p.g2 || 0) + (p.g3a || 0), p1: p.g1 || 0, p2: p.g2 || 0, p3: (p.g3a || 0) + (p.g3o || 0), p4: p.g4 || 0, r16: p.r16 || 0, qf: p.qf || 0, sf: p.sf || 0, fin: p.fin || 0, ch: p.ch || 0 }; });
      return { label: s.label, idx: s.idx, probs };
    });
    return { gn: gnArg, sims, teams, snaps: data };
  };
  // Botão manual "↻ recalcular" de um grupo.
  const computeGroupEvo = (gnArg) => {
    setEvoTblLoading(true);
    setTimeout(() => {
      try { const tbl = buildGroupEvo(gnArg); setEvoAll(p => ({ ...p, [gnArg]: tbl })); } catch (e) { /* mantém tabela anterior */ }
      setEvoTblLoading(false);
    }, 30);
  };
  // Pré-preenche os 12 grupos em segundo plano (1 grupo por tick), com progresso e cancelamento.
  const evoRunRef = useRef(0);
  const precomputeEvoAll = () => {
    const runId = ++evoRunRef.current;
    const gns = Object.keys(groups);
    setEvoAllProg({ done: 0, total: gns.length });
    let k = 0;
    const next = () => {
      if (evoRunRef.current !== runId) return; // nova rodada cancelou esta
      if (k >= gns.length) { _dynAdj = dynElo ? computeDynAdj(groups, userRes, DYN_K) : {}; setEvoAllProg(null); return; } // restaura ajuste vigente p/ render
      const gn = gns[k];
      try { const tbl = buildGroupEvo(gn); setEvoAll(p => ({ ...p, [gn]: tbl })); } catch (e) { /* ignora grupo que falhar */ }
      k++; setEvoAllProg({ done: k, total: gns.length });
      setTimeout(next, 0);
    };
    setTimeout(next, 0);
  };
  // Tabela de comparação de modelos (Brier/log-loss) — reaproveitada na aba Modelos e em Surpresas.
  const renderModelBacktest = () => {
    const nFilled = GS.reduce((s, _, idx) => s + ((userRes[idx]?.gA != null && userRes[idx]?.gB != null) ? 1 : 0), 0);
    const RAT = { fifa: 'FIFA', elo: 'Elo', bet: 'Apostas', pele: 'PELE' };
    return (
      <div>
        <div style={{ fontSize: '11px', color: dm, marginBottom: '10px', lineHeight: 1.5 }}>Compara 48 configurações de modelo (4 ratings × tilt on/off × favoritismo on/off × mando 0/70/150) contra os <strong>{nFilled}</strong> jogos de fase de grupos já preenchidos, medindo <strong>Brier</strong> e <strong>log-loss</strong> (menor = melhor). Útil para descobrir qual modelo está acertando mais durante a Copa. Lesões não entram (são prospectivas).</div>
        <button onClick={runBacktest} disabled={bsLoading || nFilled < 1} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 700, background: nFilled < 1 ? card : `${acc}33`, color: nFilled < 1 ? dm : acc, border: `1px solid ${nFilled < 1 ? bd : acc}`, borderRadius: '5px', cursor: nFilled < 1 ? 'default' : 'pointer', marginBottom: '12px' }}>{bsLoading ? 'Calculando…' : nFilled < 1 ? 'Preencha resultados de grupo primeiro' : `🔬 Rodar backtest (${nFilled} jogos)`}</button>
        {bsData && bsData.n > 0 && (() => {
          const best = bsData.results.find(r => !r.random); const bestLL = [...bsData.results].filter(r => !r.random).sort((a, b) => a.logloss - b.logloss)[0];
          const randomEntry = bsData.results.find(r => r.random); const randomRank = bsData.results.indexOf(randomEntry) + 1;
          const nModels = bsData.results.filter(r => !r.random).length;
          const rows = bsShowAll ? bsData.results : bsData.results.slice(0, 20); const randomShown = rows.includes(randomEntry);
          const rowOf = (r, rank) => (
            <tr key={rank} style={{ background: r.random ? `${acc}14` : rank === 1 ? `${gn}11` : 'transparent', borderTop: r.random && !randomShown ? `1px dashed ${acc}66` : undefined }}>
              <td style={{ padding: '3px 6px', textAlign: 'right', color: r.random ? acc : dm }}>{rank}</td>
              <td style={{ padding: '3px 6px', fontWeight: 600, color: r.random ? acc : tx, fontStyle: r.random ? 'italic' : 'normal' }}>{r.random ? '🎲 Aleatório (1/3)' : RAT[r.rs]}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', color: r.random ? dm : r.tl ? gn : dm }}>{r.random ? '—' : r.tl ? 'on' : '—'}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', color: r.random ? dm : r.fv ? gn : dm }}>{r.random ? '—' : r.fv ? 'on' : '—'}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', color: r.random ? dm : tx }}>{r.random ? '—' : r.hbv}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 700, color: r === best ? gn : r.random ? acc : tx }}>{r.brier.toFixed(4)}</td>
              <td style={{ padding: '3px 6px', textAlign: 'right', color: r === bestLL ? bl : dm }}>{r.logloss.toFixed(4)}</td>
            </tr>
          );
          return (
            <div>
              <div style={{ fontSize: '10px', color: dm, marginBottom: '6px' }}>Baseado em {bsData.n} jogos. {bsData.n < 12 && <span style={{ color: acc }}>Amostra pequena — resultados ainda ruidosos.</span>} Brier varia de 0 (perfeito) a 2; o modelo aleatório (🎲) é a linha de base — qualquer modelo abaixo dele tem skill.</div>
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '440px' }}>
                <thead><tr>{['#', 'Rating', 'Tilt', 'Favorit.', 'Mando', 'Brier ↓', 'Log-loss'].map(h => <th key={h} style={{ padding: '4px 6px', textAlign: h === 'Rating' ? 'left' : 'right', color: dm, fontSize: '9px', borderBottom: `1px solid ${bd}` }}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r, i) => rowOf(r, i + 1))}
                  {!randomShown && rowOf(randomEntry, randomRank)}
                </tbody>
              </table>
              </div>
              <div style={{ fontSize: '10px', color: dm, marginTop: '8px' }}>🏆 Melhor por Brier: <strong style={{ color: gn }}>{RAT[best.rs]}{best.tl ? ' +tilt' : ''}{best.fv ? ' +favorit.' : ''} · mando {best.hbv}</strong> (Brier {best.brier.toFixed(4)}). <strong style={{ color: acc }}>{bsData.nBeat}</strong> de {nModels} modelos superam o aleatório. {bsShowAll ? `Mostrando todos os ${nModels}.` : `Mostrando as 20 melhores de ${nModels}.`} <span onClick={() => setBsShowAll(v => !v)} style={{ color: acc, cursor: 'pointer', textDecoration: 'underline', fontWeight: 700 }}>{bsShowAll ? 'ver só top 20' : `ver todos (${nModels})`}</span></div>
            </div>
          );
        })()}
      </div>
    );
  };

  // Série do gráfico de evolução ao vivo — memoizada pelos CAMPOS dos eventos/placar/acréscimos:
  // arrastar o slider (tau) ou o hover NÃO recalculam a série.
  const liC = liveCard != null ? liveInputs[liveCard] : null;
  const [chartHover, setChartHover] = useState(null); // τ sob o mouse no gráfico (quantizado por minuto)
  const liveChart = useMemo(() => {
    if (liveCard == null) return null;
    _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
    const [gn, hi, ai, , city] = GS[liveCard];
    const home = groups[gn][hi], away = groups[gn][ai];
    const im = injuries[liveCard] || {};
    const eH = efCity(home, city) - (im.h || 0) * INJ_ELO;
    const eA = efCity(away, city) - (im.a || 0) * INJ_ELO;
    const cS1 = Math.max(0, Math.min(15, liC?.s1 == null ? 3 : +liC.s1 || 0));
    const cS2 = Math.max(0, Math.min(15, liC?.s2 == null ? 6 : +liC.s2 || 0));
    const base = { gA: +liC?.gA || 0, gB: +liC?.gB || 0, redsA: +liC?.redsA || 0, redsB: +liC?.redsB || 0 };
    const target = liC?.csA !== '' && liC?.csA != null && liC?.csB !== '' && liC?.csB != null ? { a: +liC.csA, b: +liC.csB } : null;
    return liveSeriesCalc(eH, eA, home, away, liC?.ev || [], cS1, cS2, base, target);
  }, [liveCard, liC?.ev, liC?.s1, liC?.s2, liC?.gA, liC?.gB, liC?.redsA, liC?.redsB, liC?.csA, liC?.csB, injuries, groups, rSys, customElo, customME, useTilt, favWeight, spread, homeAdv]);

  // Cenário modal/mediano de um grupo: cada um dos 6 jogos termina no placar
  // moda/mediana (resultados preenchidos e lesões respeitados); a tabela deriva
  // desses 6 placares — Pts/SG/GM/V-E-D consistentes entre si e entre os times.
  const groupScenario = (gn, kind) => {
    const tb = {};
    groups[gn].forEach(t => { tb[t] = { pts: 0, gd: 0, gf: 0, w: 0, d: 0, l: 0 }; });
    GS.forEach(([g, hi, ai, date, city], idx) => {
      if (g !== gn) return;
      const h = groups[gn][hi], a = groups[gn][ai];
      const fx = userRes[idx];
      let gA, gB;
      if (fx?.gA != null && fx?.gB != null) { gA = fx.gA; gB = fx.gB; }
      else {
        const _im = injuries[idx] || {};
        const sc = scoreStat(efCity(h, city) - (_im.h || 0) * INJ_ELO, efCity(a, city) - (_im.a || 0) * INJ_ELO, h, a, kind);
        gA = sc.a; gB = sc.b;
      }
      tb[h].gf += gA; tb[h].gd += gA - gB;
      tb[a].gf += gB; tb[a].gd += gB - gA;
      if (gA > gB) { tb[h].pts += 3; tb[h].w++; tb[a].l++; }
      else if (gA < gB) { tb[a].pts += 3; tb[a].w++; tb[h].l++; }
      else { tb[h].pts++; tb[a].pts++; tb[h].d++; tb[a].d++; }
    });
    const sorted = groups[gn].slice().sort((x, y) => tb[y].pts - tb[x].pts || tb[y].gd - tb[x].gd || tb[y].gf - tb[x].gf);
    return { tb, sorted };
  };

  // Evolution: snapshot probabilities at each game with a real result.
  // If evoFilterTeam set, only creates a snapshot when the played game involves that team.
  // Returns array of { mn, label, probs: {team: {ch, fin, sf, qf, r16, r32}} }
  const doEvolution = () => {
    setEvoLoading(true);
    setTimeout(() => {
      _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
      const gsIdxs = [];
      Object.keys(userRes).forEach(k => {
        if (!k.startsWith('k')) { const idx = +k; const fx = userRes[k]; if (fx?.gA != null && fx?.gB != null) gsIdxs.push(idx); }
      });
      gsIdxs.sort((a, b) => a - b);
      const koMNs = [];
      Object.keys(userRes).forEach(k => { if (k.startsWith('k')) { const mn = +k.slice(1); const fx = userRes[k]; if (fx?.gA != null && fx?.gB != null) koMNs.push(mn); } });
      koMNs.sort((a, b) => a - b);

      // Helper: does this GS game involve filterTeam?
      const gsInvolves = (idx, team) => {
        const [gn, hi, ai] = GS[idx];
        return groups[gn][hi] === team || groups[gn][ai] === team;
      };
      // Helper: does this KO game involve filterTeam? Need to resolve at the accumulated UR state right before this KO.
      const koInvolves = (mn, accUR, team) => {
        const st = resolveStandings(groups, accUR);
        const ko = resolveKO(st, accUR);
        const m = ko[mn];
        return m && (m.h === team || m.a === team);
      };

      const snapshots = [{ label: 'Início', subUR: {} }];
      const accUR = {};
      gsIdxs.forEach(idx => {
        accUR[idx] = userRes[idx];
        if (!evoFilterTeam || gsInvolves(idx, evoFilterTeam)) {
          snapshots.push({ label: 'M' + (idx + 1), subUR: { ...accUR } });
        }
      });
      koMNs.forEach(mn => {
        const koInv = !evoFilterTeam || koInvolves(mn, accUR, evoFilterTeam);
        accUR['k' + mn] = userRes['k' + mn];
        if (koInv) snapshots.push({ label: 'M' + mn, subUR: { ...accUR } });
      });

      const evoSims = Math.max(300, Math.min(2000, Math.floor((+nSim || 10000) / 3)));
      const result = snapshots.map(s => {
        const r = runMC(groups, evoSims, s.subUR, []);
        const probs = {};
        Object.keys(r.p).forEach(t => { probs[t] = { ch: r.p[t].ch, fin: r.p[t].fin, sf: r.p[t].sf, qf: r.p[t].qf, r16: r.p[t].r16, r32: r.p[t].r32 }; });
        return { label: s.label, probs };
      });
      setEvoData({ snapshots: result, nSim: evoSims, filterTeam: evoFilterTeam });
      setEvoLoading(false);
    }, 50);
  };

  const loadResultsJSON = (text) => {
    try {
      const data = JSON.parse(text);
      const newRes = { ...userRes };
      const arr = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : Object.entries(data).map(([k,v]) => ({ match: +k + 1, ...v }));
      let loaded = 0;
      arr.forEach(r => {
        let idx = -1;
        if (r.match != null) idx = r.match - 1;
        else if (r.home && r.away) {
          idx = GS.findIndex(([gn, hi, ai]) => {
            const ts = groups[gn];
            return (nm(ts[hi]) === r.home && nm(ts[ai]) === r.away) || (ts[hi] === r.home && ts[ai] === r.away);
          });
        }
        if (idx >= 0 && idx < GS.length && r.gA != null && r.gB != null) {
          newRes[idx] = { gA: +r.gA, gB: +r.gB };
          loaded++;
        }
      });
      setUserRes(newRes);
      alert(`Carregados ${loaded} resultados (${Object.keys(newRes).length} total)`);
    } catch (err) { alert('Erro ao ler JSON: ' + err.message); }
  };

  // Auto-run 10k on first load
  const didRun = useRef(false);
  useEffect(() => { if (!didRun.current) { didRun.current = true; setTimeout(doMC, 300); } }, []);
  // Auto-rerun when rating system changes
  const prevRSys = useRef(rSys);
  useEffect(() => { if (prevRSys.current !== rSys) { prevRSys.current = rSys; doMC(); } }, [rSys]);
  // Auto-rerun when tilt toggle changes
  const prevTilt = useRef(useTilt);
  useEffect(() => { if (prevTilt.current !== useTilt) { prevTilt.current = useTilt; doMC(); } }, [useTilt]);
  // Filtro instantâneo: ao mudar condições, re-filtra o pool em memória (sem re-simular).
  const prevConds = useRef(conditions);
  useEffect(() => {
    if (prevConds.current === conditions) return;
    prevConds.current = conditions;
    if (!didRun.current) return; // espera a primeira rodada do MC gerar o pool
    applyFilter(conditions);
  }, [conditions]);

  // Persistência: salva resultados e configurações no navegador (sobrevive a fechar/reabrir).
  useEffect(() => { lsSave('userRes', userRes); }, [userRes]);
  useEffect(() => { lsSave('rSys', rSys); }, [rSys]);
  useEffect(() => { lsSave('useTilt', useTilt); }, [useTilt]);
  useEffect(() => { lsSave('nSim', nSim); }, [nSim]);
  useEffect(() => { lsSave('customElo', customElo); }, [customElo]);
  useEffect(() => { lsSave('customME', customME); }, [customME]);
  useEffect(() => { lsSave('pc', pc); }, [pc]);
  useEffect(() => { lsSave('favWeight', favWeight); }, [favWeight]);
  useEffect(() => { lsSave('spread', spread); }, [spread]);
  useEffect(() => { lsSave('injuries', injuries); }, [injuries]);
  const prevInj = useRef(injuries);
  useEffect(() => { if (prevInj.current !== injuries) { prevInj.current = injuries; if (didRun.current) doMC(); } }, [injuries]);
  const setInj = (idx, side, delta) => setInjuries(p => { const cur = p[idx] || { h: 0, a: 0 }; const n = Math.max(0, Math.min(5, (cur[side] || 0) + delta)); const nc = { ...cur, [side]: n }; const np = { ...p }; if (!nc.h && !nc.a) delete np[idx]; else np[idx] = nc; return np; });
  // Backtest: compara modelos (rating × tilt × favoritismo × mando) contra os resultados de grupo já registrados.
  const runBacktest = () => {
    setBsLoading(true);
    setTimeout(() => {
      const sv = { rSys: _rSys, tilt: _useTilt, fav: _fav, hb: _hb, inj: _injM, dyn: _dynAdj };
      _injM = {}; // backtest histórico não aplica lesões (são prospectivas)
      _dynAdj = {}; // mede o rating base puro — não o ajuste dinâmico derivado destes mesmos jogos (evita circularidade)
      const matches = [];
      GS.forEach(([gn, hi, ai, date, city], idx) => {
        const r = userRes[idx];
        if (r && r.gA != null && r.gB != null) matches.push({ home: groups[gn][hi], away: groups[gn][ai], city, out: r.gA > r.gB ? 'H' : r.gA < r.gB ? 'A' : 'D' });
      });
      const out = [];
      for (const rs of ['fifa', 'elo', 'bet', 'pele']) for (const tl of [false, true]) for (const fv of [0, 1]) for (const hbv of [0, 70, 150]) {
        _rSys = rs; _useTilt = tl; _fav = fv; _hb = hbv;
        let brier = 0, logloss = 0;
        for (const mt of matches) {
          const pr = mProbs(efCity(mt.home, mt.city), efCity(mt.away, mt.city), mt.home, mt.away);
          const pH = pr.pH / 100, pD = pr.pD / 100, pA = pr.pA / 100;
          brier += (pH - (mt.out === 'H' ? 1 : 0)) ** 2 + (pD - (mt.out === 'D' ? 1 : 0)) ** 2 + (pA - (mt.out === 'A' ? 1 : 0)) ** 2;
          logloss += -Math.log(Math.max(1e-9, mt.out === 'H' ? pH : mt.out === 'D' ? pD : pA));
        }
        const n = matches.length || 1;
        out.push({ rs, tl, fv, hbv, brier: brier / n, logloss: logloss / n });
      }
      _rSys = sv.rSys; _useTilt = sv.tilt; _fav = sv.fav; _hb = sv.hb; _injM = sv.inj; _dynAdj = sv.dyn;
      // referência: modelo aleatório (1/3-1/3-1/3 em todo jogo) → Brier 2/3, log-loss ln(3)
      out.push({ rs: 'random', random: true, brier: 2 / 3, logloss: Math.log(3) });
      out.sort((a, b) => a.brier - b.brier);
      const nBeat = out.filter(r => !r.random && r.brier < 2 / 3).length;
      setBsData({ results: out, n: matches.length, nBeat });
      setBsLoading(false);
    }, 50);
  };
  useEffect(() => { lsSave('homeAdv', homeAdv); }, [homeAdv]);
  // Auto-rerun quando o peso do favoritismo muda
  const prevFav = useRef(favWeight);
  useEffect(() => { if (prevFav.current !== favWeight) { prevFav.current = favWeight; if (didRun.current) doMC(); } }, [favWeight]);
  const prevSpread = useRef(spread);
  useEffect(() => { if (prevSpread.current !== spread) { prevSpread.current = spread; if (didRun.current) doMC(); } }, [spread]);
  const prevHb = useRef(homeAdv);
  useEffect(() => { if (prevHb.current !== homeAdv) { prevHb.current = homeAdv; if (didRun.current) doMC(); } }, [homeAdv]);
  useEffect(() => { lsSave('dynElo', dynElo); }, [dynElo]);
  const prevDyn = useRef(dynElo);
  useEffect(() => { if (prevDyn.current !== dynElo) { prevDyn.current = dynElo; if (didRun.current) doMC(); } }, [dynElo]);

  const [probSort, setProbSort] = useState('ch');
  const [probSortDir, setProbSortDir] = useState(-1); // -1 = desc
  const ranked = useMemo(() => {
    if (!res) return [];
    return all.map(t => {
      const r = { t, ...res[t], elo: rt(t) };
      // GS opponent avg Elo (deterministic: avg of 3 group-mates)
      const grp = Object.entries(groups).find(([,ts]) => ts.includes(t));
      r.gsOpp = grp ? Math.round(grp[1].filter(x => x !== t).reduce((s,x) => s + rt(x), 0) / 3) : 0;
      // KO opponent avg Elo: mean of phase-level averages (equal weight per round)
      const phaseAvgs = [];
      [['R32','oppR32'],['R16','oppR16'],['QF','oppQF'],['SF','oppSF'],['Fin','oppFin']].forEach(([,pk]) => {
        if (r[pk+'N'] > 0) phaseAvgs.push(r[pk+'S'] / r[pk+'N']);
      });
      r.koOpp = phaseAvgs.length > 0 ? Math.round(phaseAvgs.reduce((s,v) => s + v, 0) / phaseAvgs.length) : 0;
      // Overall: avg of GS opp and KO phase avgs (GS counts as 1 phase)
      r.allOpp = r.koOpp > 0 ? Math.round((r.gsOpp + r.koOpp * phaseAvgs.length) / (1 + phaseAvgs.length)) : r.gsOpp;
      return r;
    }).sort((a, b) => {
      if (probSort === 't') return probSortDir === 1 ? nm(a.t).localeCompare(nm(b.t)) : nm(b.t).localeCompare(nm(a.t));
      const va = a[probSort] ?? 0, vb = b[probSort] ?? 0;
      return probSortDir === -1 ? vb - va : va - vb;
    });
  }, [res, all, probSort, probSortDir]);

  // Colors
  const bg = '#0a0f1a', card = '#111827', acc = '#c9a84c', accD = '#8b6914';
  const tx = '#e8e6e1', dm = '#8b8d94', gn = '#22c55e', rd = '#ef4444', bl = '#3b82f6', bd = '#1e293b', gd = '#fbbf24';
  const cs = { padding: '10px 14px' };
  const crd = { background: card, borderRadius: '7px', border: `1px solid ${bd}`, overflow: 'hidden' };
  const hdr = { padding: '6px 10px', fontSize: '12px', fontWeight: 700, background: `${accD}22`, borderBottom: `1px solid ${bd}` };

  // Small button
  const Tip = ({ text, children }) => (
    <span style={{ position: 'relative', cursor: 'help' }} title={text}>{children}</span>
  );
  const SB = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '4px 9px', fontSize: '10px', fontWeight: active ? 700 : 400, background: active ? `${acc}22` : card, color: active ? acc : dm, border: `1px solid ${active ? acc : bd}`, borderRadius: '4px', cursor: 'pointer' }}>{children}</button>
  );

  // Histórico de confrontos em Copas do Mundo entre a e b (base WCH, 1930-2022)
  const h2hBox = (a, b) => {
    const { matches, tally } = wcH2H(a, b);
    return (
      <div style={{ marginTop: '6px', padding: '8px 10px', background: '#0d111d', borderRadius: '4px', border: `1px solid ${bd}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', flexWrap: 'wrap', gap: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: gd }}>📜 Confrontos em Copas</span>
          {matches.length > 0 && <span style={{ fontSize: '9px', color: dm }}><span style={{ color: gn }}>{nm(a)}</span> <strong style={{ color: gn }}>{tally.wA}V</strong> <strong style={{ color: tx }}>{tally.d}E</strong> <strong style={{ color: bl }}>{tally.wB}V</strong> <span style={{ color: bl }}>{nm(b)}</span> · {matches.length} jogo{matches.length > 1 ? 's' : ''}</span>}
        </div>
        {matches.length === 0 ? <div style={{ fontSize: '9px', color: dm, fontStyle: 'italic' }}>{nm(a)} e {nm(b)} nunca se enfrentaram em Copas (1930-2022).</div>
          : matches.map((m2, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '34px 78px 1fr', gap: '6px', alignItems: 'center', fontSize: '10px', padding: '1px 0' }}>
              <span style={{ color: gd, fontWeight: 600 }}>{m2.y}</span>
              <span style={{ color: bl, fontSize: '9px' }}>{WCH_ST[m2.st] || m2.st}{m2.rep ? ' (desempate)' : ''}</span>
              <span>{fl(m2.h)} {nm(m2.h)} <strong style={{ color: m2.gh === m2.ga ? tx : (m2.gh > m2.ga ? m2.h : m2.a) === a ? gn : bl }} title={m2.gh === m2.ga ? 'empate' : `vitória de ${nm(m2.gh > m2.ga ? m2.h : m2.a)}`}>{m2.gh}–{m2.ga}</strong> {nm(m2.a)} {fl(m2.a)}{typeof m2.pen === 'string' ? <span style={{ color: dm, fontSize: '9px' }}> (pên {m2.pen.replace('-', '–')})</span> : m2.pen === 1 ? <span style={{ color: dm, fontSize: '9px' }}> (prorr.)</span> : null}</span>
            </div>
          ))}
        <div style={{ fontSize: '7px', color: `${dm}99`, marginTop: '4px' }}>Fonte: Fjelstul World Cup Database (CC-BY 4.0)</div>
      </div>
    );
  };

  // KO match card
  const KO = ({ m, sp }) => {
    const eloDiff = rt(m.home) - rt(m.away);
    const winnerIsHome = m.winner === m.home;
    const upset = (winnerIsHome && eloDiff < -150) || (!winnerIsHome && eloDiff > 150);
    const bigUpset = (winnerIsHome && eloDiff < -300) || (!winnerIsHome && eloDiff > 300);
    return (
    <div style={{ background: bigUpset ? '#f9731610' : '#0d111d', borderRadius: '5px', padding: '5px 8px', border: `1px solid ${bigUpset ? '#f97316' : upset ? acc : bd}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '9px', color: dm }}>M{m.mn} • {DOW(m.date)} {m.date} {KO_BRT[m.mn]} BRT • {m.city}</span>
        {bigUpset && <span style={{ fontSize: '9px' }}>🦓</span>}
        {upset && !bigUpset && <span style={{ fontSize: '9px', color: acc }}>!</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '6px' }}>
        <div style={{ textAlign: 'right', fontSize: '11px', fontWeight: m.winner === m.home ? 700 : 400, color: m.winner === m.home ? gd : dm }}>
          {sp && m.ph && <span style={{ fontSize: '8px', color: bl, marginRight: '2px' }}>{m.ph}</span>}{fl(m.home)} {nm(m.home)}
        </div>
        <div style={{ textAlign: 'center', fontWeight: 700, color: acc, fontSize: '13px' }}>
          {m.gA}–{m.gB}{m.pen ? <span style={{ fontSize: '8px', color: '#f97316', marginLeft: '3px', fontWeight: 600 }}>PEN</span> : m.aet ? <span style={{ fontSize: '8px', color: bl, marginLeft: '3px', fontWeight: 600 }}>AET</span> : null}
        </div>
        <div style={{ fontSize: '11px', fontWeight: m.winner === m.away ? 700 : 400, color: m.winner === m.away ? gd : dm }}>
          {fl(m.away)} {nm(m.away)}{sp && m.pa && <span style={{ fontSize: '8px', color: bl, marginLeft: '2px' }}>{m.pa}</span>}
        </div>
      </div>
    </div>
    );
  };

  const nFxGS = Object.keys(userRes).filter(k => !k.startsWith('k') && userRes[k]?.gA != null && userRes[k]?.gB != null).length;
  const nFxKO = Object.keys(userRes).filter(k => k.startsWith('k') && userRes[k]?.gA != null && userRes[k]?.gB != null).length;
  const nFx = nFxGS + nFxKO;
  // Denominador para percentuais derivados do MC: usa o nº de simulações ACEITAS (filtro condicional).
  // Sem filtro, nAccepted === tamanho da rodada, então cai no comportamento antigo.
  const mcN = (mcMeta && mcMeta.nAccepted) ? mcMeta.nAccepted : nSim;

  _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv; // Sync for render

  return (
    <div style={{ fontFamily: "'Outfit','Segoe UI',sans-serif", background: bg, color: tx, minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <header style={{ background: 'linear-gradient(135deg,#1a0a2e,#16213e 50%,#0f3460)', padding: '20px 14px 14px', textAlign: 'center', borderBottom: `2px solid ${acc}` }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, background: `linear-gradient(135deg,${gd},#fff,${gd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🏆 Copa do Mundo FIFA 2026</h1>
        <p style={{ fontSize: '11px', color: dm, marginTop: '2px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Simulador Monte Carlo</p>
      </header>

      {!res && !single ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '14px', color: acc, marginBottom: '8px' }}>⏳ Carregando simulação inicial...</div>
          <div style={{ fontSize: '11px', color: dm }}>Simulando {(+nSim || 0).toLocaleString()} Copas com modelo Poisson + Elo</div>
        </div>
      ) : (<>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', background: '#0d1220', borderBottom: `1px solid ${bd}`, flexWrap: 'wrap' }}>
        <select value={nSim} onChange={e => setNSim(+e.target.value)} style={{ padding: '5px 8px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
          {[10000, 50000, 100000, 250000].map(n => <option key={n} value={n}>{n.toLocaleString()}</option>)}
        </select>
        <button onClick={running ? cancelMC : doMC} title={running ? 'Clique para cancelar (mantém o resultado anterior)' : resultsDirty ? 'Há resultados digitados ainda não aplicados — clique para rerodar o Monte Carlo' : 'Rodar o Monte Carlo'} style={{ position: 'relative', padding: '7px 16px', fontSize: '12px', fontWeight: 700, color: '#000', background: running ? `linear-gradient(90deg, ${gd} ${mcProg || 0}%, ${bd} ${mcProg || 0}%)` : `linear-gradient(135deg,${gd},${acc})`, border: 'none', borderRadius: '6px', cursor: 'pointer', minWidth: '92px', boxShadow: resultsDirty && !running ? `0 0 0 2px ${rd}, 0 0 10px ${rd}99` : 'none' }}>
          {running ? (mcProg >= 100 ? '⏳ agregando…' : `⏳ ${mcProg || 0}% ✕`) : `▶ ${(+nSim || 0).toLocaleString()}`}
          {resultsDirty && !running && <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '11px', height: '11px', borderRadius: '50%', background: rd, border: '2px solid #0d1220' }} />}
        </button>
        {resultsDirty && !running && <span style={{ fontSize: '10px', fontWeight: 700, color: rd, whiteSpace: 'nowrap' }}>● resultados não aplicados</span>}
        <button onClick={doSingle} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: tx, background: card, border: `1px solid ${bd}`, borderRadius: '6px', cursor: 'pointer' }}>🎲 Simular 1 Copa</button>
        <select value={rSys} onChange={e => setRSys(e.target.value)} style={{ padding: '5px 8px', background: card, color: acc, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '11px', fontWeight: 600 }}>
          <option value="fifa">FIFA Ranking</option>
          <option value="elo">Elo (eloratings.net)</option>
          <option value="bet">Apostas (implícito)</option>
          <option value="pele">PELE (Silver Bulletin)</option>
        <option value="custom">✏️ Custom</option></select>
        <Tip text="Tilt: ajusta o total de gols esperados conforme o estilo das duas seleções (atacante/defensivo). Match tilt = soma dos tilts dos dois times, somada ao total de gols esperados.">
          <button onClick={() => setUseTilt(t => !t)} style={{ padding: '5px 9px', fontSize: '11px', fontWeight: 700, background: useTilt ? `${acc}33` : card, color: useTilt ? acc : dm, border: `1px solid ${useTilt ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }}>
            {useTilt ? '🎯 Tilt ON' : '🎯 Tilt'}
          </button>
        </Tip>
        <Tip text="Tilt de goleada: em desníveis grandes de Elo o total de gols sobe (o favorito goleia), como nos dados reais. Não afeta jogos equilibrados.">
          <button onClick={() => setSpread(s => !s)} style={{ padding: '5px 9px', fontSize: '11px', fontWeight: 700, background: spread ? `${acc}33` : card, color: spread ? acc : dm, border: `1px solid ${spread ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }}>
            {spread ? '⚽ Goleada ON' : '⚽ Goleada'}
          </button>
        </Tip>
        <Tip text={`Elo dinâmico: atualiza a força de cada seleção a partir dos resultados de grupo já disputados (Elo, K=${DYN_K} fixo, sem margem de vitória). Some-se ao rating escolhido e afeta só os jogos ainda não disputados. Uma goleada passa a melhorar as chances futuras do time, não só o saldo. Conservador de propósito (amostra pequena); desligado por padrão.`}>
          <button onClick={() => setDynElo(s => !s)} style={{ padding: '5px 9px', fontSize: '11px', fontWeight: 700, background: dynElo ? `${bl}33` : card, color: dynElo ? bl : dm, border: `1px solid ${dynElo ? bl : bd}`, borderRadius: '5px', cursor: 'pointer' }}>
            {dynElo ? '📈 Elo dinâmico ON' : '📈 Elo dinâmico'}
          </button>
        </Tip>
        {nFx > 0 && <span style={{ fontSize: '10px', color: gn }}>✓ {nFx} fixo(s)</span>}
        {conditions.length > 0 && <span style={{ fontSize: '10px', color: acc }}>🔎 {conditions.length} condição(ões)</span>}
        {mcMeta && mcMeta.conds && mcMeta.conds.length > 0 && <span style={{ fontSize: '10px', color: mcMeta.nAccepted < 200 ? rd : gn }}>· {mcMeta.nAccepted.toLocaleString()}/{mcMeta.n.toLocaleString()} aceitas ({(mcMeta.nAccepted / mcMeta.n * 100).toFixed(1)}%)</span>}
      </div>
      {mcErr && <div style={{ margin: '0 10px 6px', padding: '6px 10px', fontSize: '10px', color: rd, background: '#ef444415', border: '1px solid #ef444444', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span>⚠ {mcErr} — o resultado anterior foi mantido. Tente rodar de novo (se persistir, reduza o nº de simulações).</span>
        <button onClick={() => setMcErr(null)} style={{ background: 'transparent', border: 'none', color: rd, cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}>✕</button>
      </div>}
      {dynElo && res && (() => {
        const movers = Object.entries(_dynAdj).filter(([, v]) => Math.abs(v) >= 0.5).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 8);
        if (!movers.length) return null;
        return (
          <div style={{ margin: '0 10px 6px', padding: '5px 10px', fontSize: '10px', color: dm, background: `${bl}10`, border: `1px solid ${bl}33`, borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} title={`Ajuste dinâmico de Elo (K=${DYN_K}) aplicado sobre o rating base a partir dos resultados de grupo já disputados. Afeta só os jogos ainda não simulados.`}>
            <span style={{ color: bl, fontWeight: 700 }}>📈 Elo dinâmico:</span>
            {movers.map(([t, v]) => <span key={t} style={{ whiteSpace: 'nowrap' }}>{fl(t)} {nm(t)} <strong style={{ color: v > 0 ? gn : rd }}>{v > 0 ? '+' : ''}{Math.round(v)}</strong></span>)}
          </div>
        );
      })()}

      {/* Tabs */}
      <nav style={{ display: 'flex', gap: '1px', padding: '5px 10px', background: '#0d1220', overflowX: 'auto', borderBottom: `1px solid ${bd}` }}>
        {[['groups', '⚽ Times'], ['results', '📝 Resultados'], ['probs', '📊 Probs'], ['matchups', '🔀 Cruzam.'], ['single', '🎲 1 Copa'], ['evolution', '📈 Evolução'], ['info', 'ℹ️']].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '6px 11px', fontSize: '11px', fontWeight: tab === id ? 700 : 500, color: tab === id ? acc : dm, background: tab === id ? '#1a2236' : 'transparent', border: 'none', borderRadius: '4px 4px 0 0', cursor: 'pointer', borderBottom: tab === id ? `2px solid ${acc}` : '2px solid transparent', whiteSpace: 'nowrap' }}>{l}</button>
        ))}
      </nav>

      <main style={{ minHeight: '400px' }}>

        {/* GRUPOS */}
        {tab === 'groups' && (
          <div>
            <div style={{ display: 'flex', gap: '3px', padding: '8px 14px', marginBottom: '4px' }}>
              <SB active={!grpView} onClick={() => setGrpView('')}>Grupos</SB>
              {rSys === 'custom' && <SB active={grpView === 'edit'} onClick={() => setGrpView('edit')}>✏️ Editar Elos</SB>}
            </div>
            {/* ME control */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '0 14px', marginBottom: '8px' }}>
              <Tip text="Gols esperados por jogo entre times médios. 2.6 = padrão Copa. Muda o fator interno do Poisson.">
                <span style={{ fontSize: '9px', color: dm }}>Gols/jogo:</span>
              </Tip>
              <button onClick={() => setCustomME(m => Math.max(0.6, +(m - 0.05).toFixed(2)))} style={{ width: '22px', height: '22px', fontSize: '12px', fontWeight: 700, color: tx, background: card, border: `1px solid ${bd}`, borderRadius: '4px', cursor: 'pointer', lineHeight: '18px' }}>−</button>
              <span style={{ fontSize: '12px', color: acc, fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>{(customME * 2).toFixed(1)}</span>
              <button onClick={() => setCustomME(m => Math.min(2.0, +(m + 0.05).toFixed(2)))} style={{ width: '22px', height: '22px', fontSize: '12px', fontWeight: 700, color: tx, background: card, border: `1px solid ${bd}`, borderRadius: '4px', cursor: 'pointer', lineHeight: '18px' }}>+</button>
              {customME !== 1.32 && <button onClick={() => setCustomME(1.32)} style={{ fontSize: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>reset</button>}
            </div>
            {/* Favoritismo control */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '0 14px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <Tip text="Quanto o favorito é beneficiado em desníveis grandes de Elo. 0 = modelo antigo (conservador). 1 = calibrado contra ~3000 jogos reais. Não afeta jogos equilibrados.">
                <span style={{ fontSize: '9px', color: dm }}>Favoritismo:</span>
              </Tip>
              <input type="range" min="0" max="1" step="0.05" value={favWeight} onChange={e => setFavWeight(+e.target.value)} style={{ width: '120px' }} />
              <span style={{ fontSize: '12px', color: acc, fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{(+favWeight).toFixed(2)}</span>
              <span style={{ fontSize: '8px', color: dm }}>{favWeight <= 0.02 ? '(modelo antigo)' : favWeight >= 0.98 ? '(calibrado)' : ''}</span>
              {favWeight !== 1 && <button onClick={() => setFavWeight(1)} style={{ fontSize: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>reset</button>}
            </div>
            {/* Vantagem de mando control */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '0 14px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <Tip text="Bônus de Elo para EUA, México ou Canadá quando jogam em cidade do próprio país. Histórico: ~70 para anfitrião de torneio, ~95 para mando de eliminatória. Não afeta jogos sem anfitrião no próprio país.">
                <span style={{ fontSize: '9px', color: dm }}>Mando (anfitriã):</span>
              </Tip>
              <input type="range" min="0" max="120" step="5" value={homeAdv} onChange={e => setHomeAdv(+e.target.value)} style={{ width: '120px' }} />
              <span style={{ fontSize: '12px', color: acc, fontWeight: 700, minWidth: '46px', textAlign: 'center' }}>+{homeAdv} Elo</span>
              <span style={{ fontSize: '8px', color: dm }}>{homeAdv === 0 ? '(sem mando)' : homeAdv >= 90 ? '(eliminatória)' : homeAdv >= 60 && homeAdv <= 80 ? '(anfitrião)' : ''}</span>
              {homeAdv !== 70 && <button onClick={() => setHomeAdv(70)} style={{ fontSize: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>reset</button>}
            </div>
            {grpView === 'edit' && rSys === 'custom' && <div style={{ padding: '0 14px' }}>
              <div style={{ fontSize: '11px', color: dm, marginBottom: '8px' }}>Edite o Elo de cada time. Valores padrão baseados no sistema Elo (eloratings.net).</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <button onClick={() => setCustomElo({})} style={{ padding: '3px 8px', fontSize: '9px', color: '#ef4444', background: 'transparent', border: '1px solid #ef444433', borderRadius: '3px', cursor: 'pointer' }}>Reset todos</button>
                <button onClick={() => { const e = {}; all.forEach(t => { e[t] = ELO[t] || 1400; }); setCustomElo(e); }} style={{ padding: '3px 8px', fontSize: '9px', color: bl, background: 'transparent', border: `1px solid ${bl}33`, borderRadius: '3px', cursor: 'pointer' }}>Copiar Elo base</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '6px' }}>
                {Object.entries(groups).map(([gn, ts]) => (
                  <div key={gn} style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '6px 8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: acc, marginBottom: '4px' }}>Grupo {gn}</div>
                    {ts.map(t => (
                      <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '10px', minWidth: '80px' }}>{fl(t)} {nm(t)}</span>
                        <input type="number" value={customElo[t] ?? ELO[t] ?? 1400} onChange={e => setCustomElo(p => ({ ...p, [t]: +e.target.value }))} style={{ width: '55px', padding: '2px 4px', fontSize: '10px', background: '#0d111d', color: customElo[t] ? acc : dm, border: `1px solid ${customElo[t] ? acc : bd}`, borderRadius: '3px', textAlign: 'right' }}/>
                        <span style={{ fontSize: '8px', color: dm }}>{ELO[t]}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>}
            {!grpView && (() => {
              const grpAvg = Object.entries(groups).map(([gn, ts]) => ({ gn, avg: Math.round(ts.reduce((s,t) => s + rt(t), 0) / ts.length) })).sort((a,b) => b.avg - a.avg);
              const grpRank = Object.fromEntries(grpAvg.map((g, i) => [g.gn, i + 1]));
              return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '8px', padding: '0 14px 14px' }}>
              {Object.entries(groups).map(([gn, ts]) => {
                const avg = Math.round(ts.reduce((s,t) => s + rt(t), 0) / ts.length);
                const rank = grpRank[gn];
                return (
                <div key={gn} style={crd}>
                  <div style={{ ...hdr, display: 'flex', justifyContent: 'space-between' }}><span>Grupo {gn}</span><span style={{ fontSize: '9px', color: rank <= 3 ? gn : rank >= 10 ? rd : dm, fontWeight: 400 }}>Ø{avg} <span style={{ fontSize: '8px' }}>#{rank}</span></span></div>
                  {ts.map((t, i) => {
                    const tv = TILT[t];
                    const tCol = tv == null ? dm : tv >= .15 ? '#f59e0b' : tv <= -.15 ? '#a855f7' : dm;
                    const tBg = tv == null ? 'transparent' : tv >= .4 ? '#f59e0b22' : tv <= -.4 ? '#a855f722' : 'transparent';
                    return (
                    <div key={t} style={{ display: 'grid', gridTemplateColumns: useTilt ? '22px 1fr 32px 40px 38px' : '22px 1fr 38px 42px', alignItems: 'center', padding: '4px 10px', background: i % 2 ? '#0d111d' : 'transparent', fontSize: '11px' }}>
                      <span>{fl(t)}</span><span style={{ fontWeight: 500 }}>{nm(t)}</span>
                      <span style={{ textAlign: 'right', color: dm, fontSize: '9px' }}>{CF[t]}</span>
                      <span style={{ textAlign: 'right', color: acc, fontWeight: 600 }}>{rSys === 'custom' ? (customElo[t] ?? ELO[t] ?? '?') : rSys === 'elo' ? (ELO[t] || '?') : rSys === 'bet' ? (BET[t] || '?') : rSys === 'pele' ? (PELE[t] != null ? (PELE_EST.has(t) ? PELE[t] + '~' : PELE[t]) : (ELO[t] || '?') + '*') : (FP[t] || '?')}</span>
                      {useTilt && <Tip text={tv == null ? 'Tilt não fornecido (assume 0 = balanceado)' : tv >= .4 ? 'Muito atacante' : tv >= .08 ? 'Atacante' : tv <= -.4 ? 'Muito defensivo' : tv <= -.08 ? 'Defensivo' : 'Balanceado'}><span style={{ textAlign: 'right', color: tCol, fontWeight: 700, fontSize: '10px', background: tBg, borderRadius: '3px', padding: '1px 4px' }}>{tv == null ? '—' : (tv > 0 ? '+' : '') + tv.toFixed(2)}</span></Tip>}
                    </div>
                    );
                  })}
                </div>
                );
              })}
            </div>;
            })()}
          </div>
        )}

        {/* PROBS */}
        {tab === 'probs' && (
          !res ? <div style={{ padding: '60px', textAlign: 'center', color: dm }}>Rode a simulação</div> :
          <div style={{ ...cs, overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
              <SB active={probsView === 'table'} onClick={() => setProbsView('table')}>Geral</SB>
              <SB active={probsView === 'group'} onClick={() => setProbsView('group')}>Por Grupo</SB>
              <SB active={probsView === 'bracket'} onClick={() => setProbsView('bracket')}>Bracket</SB>
            </div>
            <div style={{ fontSize: '10px', color: dm, marginBottom: '6px' }}>Sistema: <strong style={{ color: acc }}>{rSys === 'elo' ? 'Elo (eloratings.net)' : rSys === 'bet' ? 'Apostas (implícito)' : rSys === 'pele' ? 'PELE (Silver Bulletin)' : rSys === 'custom' ? 'Custom' : 'FIFA Ranking'}</strong>{useTilt ? <span style={{ color: dm }}> • 🎯 Tilt ativo</span> : ''} • {(+nSim || 0).toLocaleString()} simulações{mcMeta && mcMeta.conds && mcMeta.conds.length > 0 ? <span style={{ color: mcMeta.nAccepted < 200 ? rd : acc }}> • 🔎 condicionado: {mcMeta.nAccepted.toLocaleString()} aceitas ({(mcMeta.nAccepted / mcMeta.n * 100).toFixed(1)}%)</span> : ''}{nFx > 0 ? ` • ✓ ${nFx} resultado(s)` : ''}</div>
            {mcMeta && mcMeta.conds && mcMeta.conds.length > 0 && mcMeta.nAccepted < 200 && <div style={{ fontSize: '10px', color: rd, marginBottom: '6px', background: '#ef444415', padding: '5px 8px', borderRadius: '4px', border: '1px solid #ef444444' }}>⚠ Amostra condicional pequena ({mcMeta.nAccepted} sims) — os percentuais têm ruído alto. Aumente o nº de simulações ou relaxe as condições.</div>}
            {probsView === 'table' && <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '780px' }}>
              <thead><tr style={{ borderBottom: `2px solid ${bd}` }}>
                {[['#','#'],['Seleção','t'],[rSys === 'elo' ? 'Elo' : rSys === 'bet' ? 'Bet' : rSys === 'pele' ? 'PELE' : rSys === 'custom' ? 'Custom' : 'FIFA','elo'],['🏆','ch'],['🥉','p3'],['4°T','p4'],['Final','fin'],['Semi','sf'],['QF','qf'],['R16','r16'],['R32','r32'],['1°G','g1'],['2°G','g2'],['3°✓','g3a'],['3°✗','g3o'],['4°G','g4'],['OppGS','gsOpp'],['OppKO','koOpp'],['OppAll','allOpp']].map(([h,k]) => (
                  <th key={h} onClick={() => { if (k !== '#') { if (probSort === k) setProbSortDir(d => d * -1); else { setProbSort(k); setProbSortDir(k === 't' ? 1 : -1); } } }} style={{ padding: '5px 3px', textAlign: h === 'Seleção' ? 'left' : 'right', color: probSort === k ? acc : dm, fontSize: '9px', fontWeight: 600, cursor: k !== '#' ? 'pointer' : 'default' }}>{h}{probSort === k ? (probSortDir === -1 ? '↓' : '↑') : ''}</th>
                ))}
              </tr></thead>
              <tbody>{ranked.map((r, i) => (
                <tr key={r.t} style={{ background: i < 3 ? `${gd}08` : i % 2 === 0 ? 'transparent' : '#0d111d' }}>
                  <td style={{ padding: '4px 3px', textAlign: 'right', color: dm, fontSize: '10px' }}>{i + 1}</td>
                  <td style={{ padding: '4px 3px', fontWeight: 600, whiteSpace: 'nowrap' }}>{fl(r.t)} {nm(r.t)}</td>
                  <td style={{ padding: '4px 3px', textAlign: 'right', color: dm, fontSize: '10px' }}>{rt(r.t)}</td>
                  <td style={{ padding: '4px 3px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      <div style={{ height: '12px', width: `${Math.min(r.ch * 4, 100)}px`, background: i === 0 ? gd : i < 3 ? '#9ca3af' : acc, borderRadius: '2px', minWidth: r.ch > 0 ? '3px' : '0' }} />
                      <span style={{ fontWeight: 700, color: acc, minWidth: '32px', textAlign: 'right' }}>{r.ch.toFixed(1)}%</span>
                    </div>
                  </td>
                  {['p3', 'p4', 'fin', 'sf', 'qf', 'r16', 'r32', 'g1', 'g2', 'g3a', 'g3o', 'g4'].map(k => (
                    <td key={k} style={{ padding: '4px 3px', textAlign: 'right', color: k === 'g4' || k === 'g3o' ? '#ef4444' : k === 'p3' ? '#d97706' : k === 'p4' ? '#8b8d94' : '#e8e6e1', fontSize: '10px' }}>{r[k]?.toFixed(1)}%</td>
                  ))}
                  {['gsOpp', 'koOpp', 'allOpp'].map(k => (
                    <td key={k} style={{ padding: '4px 3px', textAlign: 'right', color: r[k] > 1650 ? '#ef4444' : r[k] > 1550 ? acc : dm, fontSize: '10px', fontWeight: 500 }}>{r[k] || '—'}</td>
                  ))}
                </tr>
              ))}</tbody>
            </table>}
            {probsView === 'bracket' && posWho && res && (() => {
              // Greedy dedup: each team appears once in its best position
              const assign = {};
              const used = new Set();
              const cands = [];
              Object.entries(posWho).forEach(([pos, teams]) => {
                Object.entries(teams).forEach(([t, c]) => { cands.push({ pos, t, c: c / mcN * 100 }); });
              });
              cands.sort((a, b) => b.c - a.c);
              cands.forEach(({ pos, t, c }) => { if (!assign[pos] && !used.has(t)) { assign[pos] = { t, pct: c }; used.add(t); } });

              // Best 8 third-place: rank by individual g3p probability
              const g3ranked = g3p ? Object.entries(g3p).sort((a,b) => b[1] - a[1]) : [];
              const top8set = new Set(g3ranked.slice(0, 8).map(([g]) => g));
              
              // Most likely AC combo for bracket trace (needed for Annex C matchup assignment)
              const topCombo = comboList?.[0]?.key || 'ABDEGHIK';
              const acEntries = AC_RAW.split('|').map(e => { const [k,v]=e.split(':'); return {groups:k,assign:v}; });
              // Find best combo whose groups match top8set (or fallback to most frequent)
              let bestCombo = topCombo;
              const top8str = g3ranked.slice(0,8).map(([g])=>g).sort().join('');
              const exactMatch = acEntries.find(e => e.groups === top8str);
              if (exactMatch) bestCombo = top8str;
              if (selCombo && AC[selCombo]) bestCombo = selCombo; // cenário fixado manualmente pelo usuário
              const comboFixed = !!(selCombo && AC[selCombo]);
              const acMatch = acEntries.find(e => e.groups === bestCombo) || acEntries[0];
              const W8 = ['A','B','D','E','G','I','K','L'];
              const thirdAssign = {}; // slot label -> group letter of 3rd
              if (acMatch) acMatch.assign.split('').forEach((g, i) => { thirdAssign[W8[i]] = g; });

              // Build R32 matchups using positions
              const r32Spec = [
                {mn:73,h:'A2',a:'B2',hk:'A',hp:2,ak:'B',ap:2,city:'Los Angeles'},
                {mn:74,h:'E1',a:'3',hk:'E',hp:1,ak:thirdAssign['E']||'?',ap:3,city:'Boston',third:'E'},
                {mn:75,h:'F1',a:'C2',hk:'F',hp:1,ak:'C',ap:2,city:'Monterrey'},
                {mn:76,h:'C1',a:'F2',hk:'C',hp:1,ak:'F',ap:2,city:'Houston'},
                {mn:77,h:'I1',a:'3',hk:'I',hp:1,ak:thirdAssign['I']||'?',ap:3,city:'NY/NJ',third:'I'},
                {mn:78,h:'E2',a:'I2',hk:'E',hp:2,ak:'I',ap:2,city:'Dallas'},
                {mn:79,h:'A1',a:'3',hk:'A',hp:1,ak:thirdAssign['A']||'?',ap:3,city:'Cd.Mexico',third:'A'},
                {mn:80,h:'L1',a:'3',hk:'L',hp:1,ak:thirdAssign['L']||'?',ap:3,city:'Atlanta',third:'L'},
                {mn:81,h:'D1',a:'3',hk:'D',hp:1,ak:thirdAssign['D']||'?',ap:3,city:'S.Francisco',third:'D'},
                {mn:82,h:'G1',a:'3',hk:'G',hp:1,ak:thirdAssign['G']||'?',ap:3,city:'Seattle',third:'G'},
                {mn:83,h:'K2',a:'L2',hk:'K',hp:2,ak:'L',ap:2,city:'Toronto'},
                {mn:84,h:'H1',a:'J2',hk:'H',hp:1,ak:'J',ap:2,city:'Los Angeles'},
                {mn:85,h:'B1',a:'3',hk:'B',hp:1,ak:thirdAssign['B']||'?',ap:3,city:'Vancouver',third:'B'},
                {mn:86,h:'J1',a:'H2',hk:'J',hp:1,ak:'H',ap:2,city:'Miami'},
                {mn:87,h:'K1',a:'3',hk:'K',hp:1,ak:thirdAssign['K']||'?',ap:3,city:'Kansas City',third:'K'},
                {mn:88,h:'D2',a:'G2',hk:'D',hp:2,ak:'G',ap:2,city:'Dallas'},
              ];

              // Resolve teams from assign
              const resolveTeam = (gn, pos) => assign[gn+pos]?.t || '?';
              const getElo = (t) => t === '?' ? 1200 : rt(t);
              // Use MC data to determine bracket winner when available
              const mcWinner = (h, a, nextPhase) => {
                if (!res || h === '?' || a === '?') return getElo(h) >= getElo(a) ? h : a;
                const hAdv = res[h]?.[nextPhase] || 0;
                const aAdv = res[a]?.[nextPhase] || 0;
                return hAdv >= aAdv ? h : a;
              };

              const r32 = r32Spec.map(s => {
                const hTeam = resolveTeam(s.hk, s.hp);
                const aTeam = s.ap === 3 ? (assign[s.ak+'3']?.t || '?') : resolveTeam(s.ak, s.ap);
                const hPos = s.hk + s.hp;
                const aPos = s.ap === 3 ? s.ak + '3' : s.ak + s.ap;
                const winner = mcWinner(hTeam, aTeam, 'r16');
                const wPos = winner === hTeam ? hPos : aPos;
                return { ...s, hTeam, aTeam, hPos, aPos, winner, wPos };
              });

              // R16: M89=W74xW77, M90=W73xW75, M91=W76xW78, M92=W79xW80, M93=W83xW84, M94=W81xW82, M95=W86xW88, M96=W85xW87
              const r16Spec = [
                {mn:89,hi:1,ai:4,city:'Filadelfia'},{mn:90,hi:0,ai:2,city:'Houston'},
                {mn:91,hi:3,ai:5,city:'NY/NJ'},{mn:92,hi:6,ai:7,city:'Cd.Mexico'},
                {mn:93,hi:10,ai:11,city:'Dallas'},{mn:94,hi:8,ai:9,city:'Seattle'},
                {mn:95,hi:13,ai:15,city:'Atlanta'},{mn:96,hi:12,ai:14,city:'Vancouver'},
              ];
              const r16 = r16Spec.map(s => {
                const hTeam = r32[s.hi].winner, aTeam = r32[s.ai].winner;
                const hPos = r32[s.hi].wPos, aPos = r32[s.ai].wPos;
                const winner = mcWinner(hTeam, aTeam, 'qf');
                const wPos = winner === hTeam ? hPos : aPos;
                return { ...s, hTeam, aTeam, hPos, aPos, winner, wPos };
              });

              // QF: M97=W89xW90, M98=W93xW94, M99=W91xW92, M100=W95xW96
              const qf = [
                {mn:97,hi:0,ai:1,city:'Boston'},{mn:98,hi:4,ai:5,city:'Los Angeles'},
                {mn:99,hi:2,ai:3,city:'Miami'},{mn:100,hi:6,ai:7,city:'Kansas City'},
              ].map(s => {
                const hTeam = r16[s.hi].winner, aTeam = r16[s.ai].winner;
                const hPos = r16[s.hi].wPos, aPos = r16[s.ai].wPos;
                const winner = mcWinner(hTeam, aTeam, 'sf');
                const wPos = winner === hTeam ? hPos : aPos;
                return { ...s, hTeam, aTeam, hPos, aPos, winner, wPos };
              });

              const sf = [
                {mn:101,hi:0,ai:1,city:'Dallas'},{mn:102,hi:2,ai:3,city:'Atlanta'},
              ].map(s => {
                const hTeam = qf[s.hi].winner, aTeam = qf[s.ai].winner;
                const hPos = qf[s.hi].wPos, aPos = qf[s.ai].wPos;
                const winner = mcWinner(hTeam, aTeam, 'fin');
                return { ...s, hTeam, aTeam, hPos, aPos, winner };
              });

              const finH = sf[0].winner, finA = sf[1].winner;

              // Match box component (clicável → painel de detalhe abaixo do bracket)
              const MB = ({ mn, hTeam, aTeam, hPos, aPos, winner, city, label }) => (
                <div onClick={() => setBracketSel(s => s?.type === 'match' && s.mn === mn ? null : { type: 'match', mn })} title="Clique para ver quem pode jogar esta partida" style={{ background: '#0d111d', borderRadius: '3px', border: `1px solid ${bracketSel?.type === 'match' && bracketSel.mn === mn ? acc : bd}`, minWidth: '130px', maxWidth: '165px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '7px', color: dm, padding: '0 4px', borderBottom: `1px solid ${bd}33`, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{label} {DOW(KO_DATE[mn])} {KO_DATE[mn]} {KO_BRT[mn]} {city}</span>
                    <span style={{ color: bl, fontFamily: 'monospace', fontWeight: 600 }}>{hPos}x{aPos}</span>
                  </div>
                  {[{t:hTeam,p:hPos},{t:aTeam,p:aPos}].map(({t,p}) => {
                    const w = t === winner;
                    const pct = matchWhoData?.[mn] ? ((matchWhoData[mn][t]||0)/ mcN*100) : 0;
                    return <div key={p} style={{ display:'flex', justifyContent:'space-between', padding:'1px 4px', fontSize:'9px', background: w ? `${gn}08` : 'transparent', borderLeft: w ? `2px solid #22c55e` : '2px solid transparent' }}>
                      <span style={{ color: w ? tx : dm, fontWeight: w ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        <span style={{ fontSize:'7px', color: bl, marginRight:'2px' }}>{p}</span>{t !== '?' ? `${fl(t)}${nm(t)}` : '?'}
                      </span>
                      <span style={{ fontSize:'8px', color: w ? '#22c55e' : dm, fontWeight: 600 }}>{pct > 0 ? pct.toFixed(0)+'%' : ''}</span>
                    </div>;
                  })}
                </div>
              );

              // Group card
              const GCard = ({ gn }) => {
                const positions = [1,2,3,4].map(p => {
                  const pk = gn+p;
                  const a = assign[pk];
                  return { pk, t: a?.t, pct: a?.pct || 0, p };
                });
                const g3adv = g3p?.[gn] || 0;
                const isTop8 = top8set.has(gn);
                return (
                  <div onClick={() => setBracketSel(s => s?.type === 'group' && s.gn === gn ? null : { type: 'group', gn })} title="Clique para ver a distribuição completa por posição" style={{ background: card, borderRadius:'4px', border:`1px solid ${bracketSel?.type === 'group' && bracketSel.gn === gn ? acc : bd}`, minWidth:'115px', maxWidth:'145px', cursor:'pointer' }}>
                    <div style={{ fontSize:'8px', fontWeight:700, color:acc, padding:'2px 4px', borderBottom:`1px solid ${bd}33`, display:'flex', justifyContent:'space-between' }}>
                      <span>Grupo {gn}</span>
                      <span style={{ fontSize:'7px', color: isTop8 ? '#22c55e' : '#ef4444' }}>3{"°↑"}{g3adv.toFixed(0)}%</span>
                    </div>
                    {positions.map(({ pk, t, pct, p }) => {
                      const adv = p <= 2 || (p === 3 && isTop8);
                      return <div key={pk} style={{ display:'flex', justifyContent:'space-between', padding:'1px 4px', fontSize:'9px', borderLeft: adv ? '2px solid #22c55e' : p === 3 ? '2px solid #ef4444' : '2px solid transparent' }}>
                        <span style={{ color: adv ? tx : dm, fontWeight: p===1 ? 600 : 400 }}>
                          <span style={{ fontSize:'7px', color: adv ? '#22c55e' : p===4 ? '#ef4444' : '#ef4444', marginRight:'2px' }}>{pk}</span>{t ? `${fl(t)}${nm(t)}` : '?'}
                        </span>
                        <span style={{ fontSize:'8px', color: pct > 60 ? '#22c55e' : pct > 30 ? acc : dm }}>{pct.toFixed(0)}%</span>
                      </div>;
                    })}
                  </div>
                );
              };

              const Col = ({children}) => <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', gap:'2px' }}>{children}</div>;
              const Con = () => <div style={{ width:'6px', borderRight:`1px solid ${bd}`, minHeight:'100%', alignSelf:'center' }}/>;

              // QF branch helper
              // Half-bracket: 4 R32 → 2 R16 → 1 QF
              const HB = ({r32a,r32b,r32c,r32d,r16a,r16b,qfi}) => (
                <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
                  <Col>
                    <Col><MB mn={r32[r32a].mn} {...r32[r32a]} label="R32"/><MB mn={r32[r32b].mn} {...r32[r32b]} label="R32"/></Col>
                    <div style={{ height:'4px' }}/>
                    <Col><MB mn={r32[r32c].mn} {...r32[r32c]} label="R32"/><MB mn={r32[r32d].mn} {...r32[r32d]} label="R32"/></Col>
                  </Col>
                  <Con/>
                  <Col><MB mn={r16[r16a].mn} {...r16[r16a]} label="R16"/><div style={{ height:'20px' }}/><MB mn={r16[r16b].mn} {...r16[r16b]} label="R16"/></Col>
                  <Con/>
                  <Col><MB mn={qf[qfi].mn} {...qf[qfi]} label="QF"/></Col>
                </div>
              );

              // Full pathway: 2 QF branches → SF
              const PW = ({hb1, hb2, sfi, label}) => (
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:bl, marginBottom:'4px' }}>{label}</div>
                  <div style={{ display:'flex', gap:'3px', alignItems:'center', overflowX:'auto' }}>
                    <Col>
                      <HB {...hb1}/>
                      <div style={{ height:'6px' }}/>
                      <HB {...hb2}/>
                    </Col>
                    <Con/>
                    <Col><MB mn={sf[sfi].mn} {...sf[sfi]} label="SF"/></Col>
                  </div>
                </div>
              );

              return (
                <div style={{ overflowX:'auto' }}>
                  {/* Champion */}
                  <div style={{ textAlign:'center', margin:'0 0 16px', padding:'12px', background:`linear-gradient(135deg,${acc}22,${card})`, borderRadius:'8px', border:`2px solid ${gd}44`, maxWidth:'350px', marginLeft:'auto', marginRight:'auto' }}>
                    <div style={{ fontSize:'8px', color:dm, marginBottom:'4px' }}>M104 Final • MetLife 19/Jul</div>
                    <div style={{ display:'flex', justifyContent:'center', gap:'10px', fontSize:'12px', marginBottom:'6px' }}>
                      <span style={{ fontWeight:700 }}>{fl(finH)} {nm(finH)}</span>
                      <span style={{ color:dm }}>vs</span>
                      <span style={{ fontWeight:700 }}>{fl(finA)} {nm(finA)}</span>
                    </div>
                    <div style={{ borderTop:`1px solid ${bd}`, paddingTop:'6px' }}>
                      <div style={{ fontSize:'8px', color:dm, marginBottom:'2px' }}>Finalistas mais prováveis</div>
                      {matchWhoData?.[104] ? Object.entries(matchWhoData[104]).sort((a,b) => b[1] - a[1]).slice(0,2).map(([t,c],i) => (
                        <div key={t} style={{ display:'flex', justifyContent:'center', gap:'6px', fontSize:'11px' }}>
                          <span style={{ fontWeight: i===0 ? 700 : 400, color: i===0 ? gd : tx }}>{fl(t)} {nm(t)}</span>
                          <span style={{ color: i===0 ? gd : acc, fontWeight:700 }}>🏆 {(res[t]?.ch||0).toFixed(1)}%</span>
                          <span style={{ fontSize:'8px', color:dm }}>({(c/ mcN*100).toFixed(0)}% final)</span>
                        </div>
                      )) : [...ranked].sort((a,b) => (b.fin||0) - (a.fin||0)).slice(0,2).map((r,i) => (
                        <div key={r.t} style={{ display:'flex', justifyContent:'center', gap:'6px', fontSize:'11px' }}>
                          <span style={{ fontWeight: i===0 ? 700 : 400, color: i===0 ? gd : tx }}>{fl(r.t)} {nm(r.t)}</span>
                          <span style={{ color: i===0 ? gd : acc, fontWeight:700 }}>🏆 {r.ch.toFixed(1)}%</span>
                          <span style={{ fontSize:'8px', color:dm }}>({(r.fin||0).toFixed(0)}% final)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pathway 1 */}
                  <PW label={"Pathway 1 → SF Dallas 14/Jul"} sfi={0}
                    hb1={{r32a:1, r32b:4, r32c:0, r32d:2, r16a:0, r16b:1, qfi:0}}
                    hb2={{r32a:10, r32b:11, r32c:8, r32d:9, r16a:4, r16b:5, qfi:1}}
                  />

                  {/* Pathway 2 */}
                  <PW label={"Pathway 2 → SF Atlanta 15/Jul"} sfi={1}
                    hb1={{r32a:3, r32b:5, r32c:6, r32d:7, r16a:2, r16b:3, qfi:2}}
                    hb2={{r32a:13, r32b:15, r32c:12, r32d:14, r16a:6, r16b:7, qfi:3}}
                  />

                  {/* Groups */}
                  <div style={{ fontSize:'11px', fontWeight:700, color:acc, marginBottom:'6px' }}>Fase de Grupos</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'4px', marginBottom:'10px' }}>
                    {Object.keys(groups).map(gn => <GCard key={gn} gn={gn}/>)}
                  </div>

                  {/* 3rd-place summary — clicável: painel global dos 3ºs */}
                  {g3p && <div onClick={() => setBracketSel(s => s?.type === 'thirds' ? null : { type: 'thirds' })} title="Clique para ver o panorama completo dos 3ºs" style={{ marginBottom:'12px', padding:'6px 10px', background:card, borderRadius:'6px', border:`1px solid ${bracketSel?.type === 'thirds' ? acc : bd}`, maxWidth:'600px', cursor:'pointer' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, color:bl, marginBottom:'3px' }}>8 melhores 3°s (por prob. individual; Anexo C: {bestCombo}){comboFixed && <span onClick={(e) => { e.stopPropagation(); setSelCombo(null); }} title="Combinação fixada manualmente — clique para voltar ao automático" style={{ marginLeft:'6px', color:acc, cursor:'pointer', textDecoration:'underline' }}>● cenário fixado ✕</span>}</div>
                    <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {Object.entries(g3p).sort((a,b)=>b[1]-a[1]).map(([gn, pct]) => {
                        const isIn = top8set.has(gn);
                        const t3 = assign[gn+'3'];
                        return <span key={gn} style={{ padding:'1px 5px', fontSize:'9px', borderRadius:'3px', fontWeight:600, background: isIn ? '#22c55e22' : '#ef444422', color: isIn ? '#22c55e' : '#ef4444', border:`1px solid ${isIn ? '#22c55e' : '#ef4444'}33` }}>
                          3{"°"}{gn} {pct.toFixed(0)}%{t3 ? ` ${fl(t3.t)}${nm(t3.t)}` : ''}
                        </span>;
                      })}
                    </div>
                  </div>}

                  {/* Painel de detalhe — clique em partida (MB), grupo (GCard) ou resumo dos 3ºs */}
                  {bracketSel && (() => {
                    const closeBtn = <button onClick={() => setBracketSel(null)} style={{ background: 'transparent', border: 'none', color: rd, cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>✕</button>;
                    if (bracketSel.type === 'thirds') {
                      const ranked = Object.entries(g3p || {}).sort((a, b) => b[1] - a[1]); // [gn, pct]
                      const thirdSlots = Object.entries(KO_SPEC).filter(([, v]) => v.a?.t === '3rd'); // [mn, spec] dos 8 matches que recebem 3ºs
                      return (
                        <div style={{ marginBottom: '12px', padding: '8px 10px', background: card, borderRadius: '6px', border: `1px solid ${acc}55`, maxWidth: '720px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: acc }}>Terceiros lugares — quem avança e para onde vai</span>
                            {closeBtn}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: 700, color: bl, marginBottom: '2px' }}>P(3º avança) por grupo</div>
                              {ranked.map(([gn, pct]) => {
                                const isIn = top8set.has(gn);
                                const cands = Object.entries(posWho?.[gn + '3'] || {}).sort((a, b) => b[1] - a[1]).slice(0, 2);
                                return (
                                  <div key={gn} style={{ display: 'grid', gridTemplateColumns: '24px 70px 36px 1fr', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '1px 0' }}>
                                    <span style={{ fontWeight: 700, color: isIn ? '#22c55e' : '#ef4444' }}>3°{gn}</span>
                                    <div style={{ height: '8px', background: `${bl}18`, borderRadius: '2px' }}><div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: isIn ? '#22c55e' : '#ef4444', borderRadius: '2px' }} /></div>
                                    <span style={{ textAlign: 'right', fontWeight: 700, color: isIn ? '#22c55e' : '#ef4444' }}>{pct.toFixed(0)}%</span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: dm }}>{cands.map(([t, c]) => `${fl(t)} ${nm(t)} ${(c / mcN * 100).toFixed(0)}%`).join(' · ')}</span>
                                  </div>
                                );
                              })}
                              <div style={{ fontSize: '8px', color: dm, marginTop: '4px', fontStyle: 'italic' }}>Barra = P(o 3º desse grupo estar entre os 8 que avançam); ao lado, quem mais provavelmente termina em 3º.</div>
                            </div>
                            <div>
                              {comboList?.length > 0 && <>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: bl, marginBottom: '2px' }}>Combinações de 8 grupos mais prováveis <span style={{ color: dm, fontWeight: 400 }}>(clique p/ fixar o cenário)</span></div>
                                {comboList.slice(0, 8).map((c, i) => {
                                  const isSel = c.key === bestCombo;
                                  return (
                                  <div key={c.key} onClick={() => setSelCombo(s => s === c.key ? null : c.key)} title="Clique para repare­ar o bracket com esta combinação de 3ºs" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '1px 4px', fontFamily: 'monospace', cursor: 'pointer', borderRadius: '3px', background: isSel ? `${acc}22` : 'transparent', border: `1px solid ${isSel ? acc : 'transparent'}` }}>
                                    <span style={{ color: isSel ? acc : tx, fontWeight: isSel ? 700 : 400 }}>{c.key}{isSel ? ' ◂' : ''}</span>
                                    <span style={{ fontWeight: 700, color: isSel ? acc : dm }}>{c.pct.toFixed(1)}%</span>
                                  </div>
                                  );
                                })}
                              </>}
                              <div style={{ fontSize: '9px', fontWeight: 700, color: bl, margin: '6px 0 2px' }}>Destino dos 3ºs na combinação {bestCombo} {comboFixed ? <span style={{ color: acc, fontWeight: 400 }}>(fixada — <span onClick={() => setSelCombo(null)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>voltar ao automático</span>)</span> : <span style={{ color: dm, fontWeight: 400 }}>(mais provável)</span>} (Anexo C)</div>
                              {thirdSlots.map(([mn, spec]) => {
                                const slot = spec.a.s; // letra do slot W3
                                const srcG = thirdAssign[slot]; // grupo cujo 3º cai aqui
                                const t3 = srcG ? assign[srcG + '3'] : null;
                                return (
                                  <div key={mn} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '1px 0' }}>
                                    <span style={{ color: dm }}>M{mn} <span style={{ color: tx }}>{spec.l}</span> • {KO_CITY[mn]}</span>
                                    <span style={{ fontWeight: 600 }}>3°{srcG || '?'}{t3 ? <span style={{ color: dm, fontWeight: 400 }}> ({fl(t3.t)} {nm(t3.t)})</span> : ''}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (bracketSel.type === 'match') {
                      const mn = bracketSel.mn;
                      const who = Object.entries(matchWhoData?.[mn] || {}).sort((a, b) => b[1] - a[1]);
                      const othersPct = who.slice(12).reduce((s, [, c]) => s + c / mcN * 100, 0);
                      const nextK = mn <= 88 ? 'r16' : mn <= 96 ? 'qf' : mn <= 100 ? 'sf' : mn <= 102 ? 'fin' : mn === 103 ? 'p3' : 'ch';
                      const nextL = { r16: 'R16%', qf: 'QF%', sf: 'SF%', fin: 'Final%', p3: '🥉%', ch: '🏆%' }[nextK];
                      const pairs = Object.entries(matchTmData?.[mn] || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
                      const poss = Object.entries(matchPosData?.[mn] || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
                      return (
                        <div style={{ marginBottom: '12px', padding: '8px 10px', background: card, borderRadius: '6px', border: `1px solid ${acc}55`, maxWidth: '720px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: acc }}>M{mn} • {KO_SPEC[mn]?.l} • {DOW(KO_DATE[mn])} {KO_DATE[mn]} {KO_BRT[mn]} • {KO_CITY[mn]}</span>
                            {closeBtn}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 46px 46px 46px', gap: '4px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 0 2px', borderBottom: `1px solid ${bd}` }}>
                                <span>Quem joga esta partida</span><span /><span style={{ textAlign: 'right' }}>joga%</span><span style={{ textAlign: 'right' }} title="P(vence | joga esta partida)">vence%*</span><span style={{ textAlign: 'right' }} title="Probabilidade incondicional (todas as sims)">{nextL}</span>
                              </div>
                              {who.slice(0, 12).map(([t, c]) => {
                                const pPlay = c / mcN * 100;
                                const pWin = matchWinData?.[mn]?.[t] ? matchWinData[mn][t] / c * 100 : 0;
                                return (
                                  <div key={t} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 46px 46px 46px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '1px 0' }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fl(t)} {nm(t)}</span>
                                    <div style={{ height: '8px', background: `${acc}18`, borderRadius: '2px' }}><div style={{ height: '100%', width: `${Math.min(pPlay, 100)}%`, background: acc, borderRadius: '2px' }} /></div>
                                    <span style={{ textAlign: 'right', fontWeight: 700, color: acc }}>{pPlay.toFixed(1)}%{dTag(pPlay, baseAgg?.matchWho?.[mn] ? (baseAgg.matchWho[mn][t] || 0) / baseN * 100 : null)}</span>
                                    <span style={{ textAlign: 'right', color: gn }}>{pWin.toFixed(0)}%</span>
                                    <span style={{ textAlign: 'right', color: dm }}>{(res[t]?.[nextK] || 0).toFixed(1)}%{dTag(res[t]?.[nextK] || 0, baseAgg?.p?.[t]?.[nextK])}</span>
                                  </div>
                                );
                              })}
                              {othersPct > 0.05 && <div style={{ fontSize: '9px', color: dm, paddingTop: '2px' }}>+ outros: {othersPct.toFixed(1)}%</div>}
                              <div style={{ fontSize: '8px', color: dm, marginTop: '4px', fontStyle: 'italic' }}>* vence% = P(vencer | estar nesta partida); {nextL} = prob. incondicional.</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '9px', fontWeight: 700, color: bl, marginBottom: '2px' }}>Confrontos mais prováveis</div>
                              {pairs.map(([k, c]) => { const [a2, b2] = k.split('|'); return (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '1px 0' }}>
                                  <span>{fl(a2)} {nm(a2)} <span style={{ color: dm }}>vs</span> {fl(b2)} {nm(b2)}</span>
                                  <span style={{ fontWeight: 700, color: bl }}>{(c / mcN * 100).toFixed(1)}%{dTag(c / mcN * 100, baseAgg?.matchTm?.[mn] ? (baseAgg.matchTm[mn][k] || 0) / baseN * 100 : null)}</span>
                                </div>
                              ); })}
                              {poss.length > 0 && <>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: bl, margin: '6px 0 2px' }}>Posições nesta partida</div>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {poss.map(([k, c]) => <span key={k} style={{ padding: '1px 6px', fontSize: '9px', borderRadius: '3px', background: `${bl}18`, color: bl, border: `1px solid ${bl}33`, fontFamily: 'monospace' }}>{k} {(c / mcN * 100).toFixed(0)}%</span>)}
                                </div>
                              </>}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    // type === 'group'
                    const gName = bracketSel.gn;
                    return (
                      <div style={{ marginBottom: '12px', padding: '8px 10px', background: card, borderRadius: '6px', border: `1px solid ${acc}55`, maxWidth: '720px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: acc }}>Grupo {gName} — quem termina em cada posição <span style={{ color: bl, fontWeight: 600 }}>• 3° avança: {(g3p?.[gName] || 0).toFixed(0)}%</span></span>
                          {closeBtn}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
                          {[1, 2, 3, 4].map(p => {
                            const entries = Object.entries(posWho?.[gName + p] || {}).sort((a, b) => b[1] - a[1]);
                            const basePos = t => { const b = baseAgg?.p?.[t]; if (!b) return null; return p === 1 ? (b.g1 || 0) : p === 2 ? (b.g2 || 0) : p === 3 ? ((b.g3a || 0) + (b.g3o || 0)) : (b.g4 || 0); };
                            return (
                              <div key={p}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: p <= 2 ? gn : p === 3 ? bl : rd, borderBottom: `1px solid ${bd}`, paddingBottom: '2px', marginBottom: '2px' }}>{gName}{p} {p <= 2 ? '(avança)' : p === 3 ? '(repescagem 3°s)' : '(eliminado)'}</div>
                                {entries.map(([t, c]) => {
                                  const pct = c / mcN * 100;
                                  return (
                                    <div key={t} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '1px 0' }}>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: pct > 50 ? tx : dm }}>{fl(t)} {nm(t)}</span>
                                      <span style={{ textAlign: 'right', fontWeight: 600, color: pct > 50 ? gn : pct > 20 ? acc : dm }}>{pct.toFixed(1)}%{dTag(pct, basePos(t))}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        )}

        {/* GROUP PROBS */}
        {tab === 'probs' && probsView === 'group' && (
          !res ? <div style={{ padding: '60px', textAlign: 'center', color: dm }}>Rode a simulação</div> :
          <div style={cs}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setGrpStat(s => s === 'mean' ? 'median' : s === 'median' ? 'mode' : 'mean')} style={{ padding: '4px 9px', fontSize: '10px', fontWeight: 700, background: grpStat !== 'mean' ? `${acc}33` : card, color: grpStat !== 'mean' ? acc : dm, border: `1px solid ${grpStat !== 'mean' ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }}>
                ◧ {grpStat === 'median' ? 'Mediana' : grpStat === 'mode' ? 'Moda' : 'Média'}
              </button>
              <button onClick={() => setGrpWDL(v => !v)} style={{ padding: '4px 9px', fontSize: '10px', fontWeight: 700, background: grpWDL ? `${acc}33` : card, color: grpWDL ? acc : dm, border: `1px solid ${grpWDL ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }}>
                {grpWDL ? '✓ V/E/D' : '+ V/E/D'}
              </button>
              <span style={{ fontSize: '9px', color: dm }}>{grpStat === 'mean' ? <>Pts, SG, GM{grpWDL ? ', V/E/D' : ''} mostram a média por simulação.</> : <>Cenário <strong style={{ color: acc }}>{grpStat === 'median' ? 'mediano' : 'modal'}</strong>: cada jogo termina no placar {grpStat === 'median' ? 'mediana' : 'moda'} (resultados preenchidos e lesões respeitados) — Pts, SG, GM{grpWDL ? ', V/E/D' : ''} e a ordem derivam desses 6 placares e são consistentes entre si. As colunas de % continuam vindas do Monte Carlo.</>}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '8px' }}>
              {Object.entries(groups).map(([gn, ts]) => {
                const stat = grpStat; // 'mean' | 'median' | 'mode'
                const sc = stat !== 'mean' ? groupScenario(gn, stat) : null; // cenário coerente (placar moda/mediana por jogo)
                const sorted = sc ? sc.sorted : ts.slice().sort((a, b) => (res[b]?.g1 || 0) - (res[a]?.g1 || 0));
                const fmtN = v => stat === 'mean' ? v.toFixed(2) : Math.round(v).toString();
                const cols = ['Seleção', 'Pts', 'SG', 'GM', ...(grpWDL ? ['V', 'E', 'D'] : []), '1°', '2°', '3°✓', '3°✗', '4°', 'Avança'];
                return (
                  <div key={gn} style={crd}>
                    <div style={{ ...hdr, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Grupo {gn}</span>
                      <span style={{ fontSize: '10px', color: bl, fontWeight: 600 }}>3° avança: {(g3p?.[gn] || 0).toFixed(0)}%</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                      <thead><tr>{cols.map(h => (
                        <th key={h} style={{ padding: '4px 5px', textAlign: h === 'Seleção' ? 'left' : 'right', color: dm, fontSize: '9px', fontWeight: 600, borderBottom: `1px solid ${bd}` }}>{h}</th>
                      ))}</tr></thead>
                      <tbody>{sorted.map(t => {
                        const r = res[t] || {};
                        const stb = sc ? sc.tb[t] : null;
                        const adv = (r.g1 || 0) + (r.g2 || 0) + (r.g3a || 0);
                        const pts = stb ? stb.pts : (r.avgPts || 0);
                        const sg = stb ? stb.gd : (r.avgGd || 0);
                        const gm = stb ? stb.gf : (r.avgGf || 0);
                        return (
                          <tr key={t}>
                            <td style={{ padding: '3px 5px', fontWeight: 500 }}>{fl(t)} {nm(t)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', fontWeight: 600, color: tx }}>{fmtN(pts)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', color: sg > 0 ? '#22c55e' : sg < 0 ? '#ef4444' : dm }}>{sg > 0 ? '+' : ''}{fmtN(sg)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', color: tx }}>{fmtN(gm)}</td>
                            {grpWDL && [stb ? stb.w : (r.avgW || 0), stb ? stb.d : (r.avgD || 0), stb ? stb.l : (r.avgL || 0)].map((v, i) => (
                              <td key={i} style={{ padding: '3px 5px', textAlign: 'right', color: i === 0 ? '#22c55e' : i === 1 ? dm : '#ef4444' }}>{fmtN(v)}</td>
                            ))}
                            {['g1', 'g2', 'g3a', 'g3o', 'g4'].map(k => (
                              <td key={k} style={{ padding: '3px 5px', textAlign: 'right', color: k === 'g1' ? '#fbbf24' : k === 'g2' ? '#22c55e' : k === 'g3a' ? '#3b82f6' : k === 'g3o' ? '#f97316' : '#ef4444' }}>{(r[k] || 0).toFixed(1)}%</td>
                            ))}
                            <td style={{ padding: '3px 5px', textAlign: 'right', fontWeight: 700, color: adv > 70 ? '#22c55e' : adv > 40 ? '#c9a84c' : '#ef4444' }}>{adv.toFixed(1)}%</td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CRUZAMENTOS */}
        {tab === 'matchups' && (
          !muPct ? <div style={{ padding: '60px', textAlign: 'center', color: dm }}>Rode a simulação</div> :
          <div style={cs}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <SB active={muView === 'round'} onClick={() => setMuView('round')}>Por Fase</SB>
              <SB active={muView === 'team'} onClick={() => setMuView('team')}>Por Seleção</SB>
              <SB active={muView === 'pos'} onClick={() => setMuView('pos')}>Por Posição</SB>
              <SB active={muView === 'combos'} onClick={() => setMuView('combos')}>Combinações 3°s</SB>
              <SB active={muView === 'venue'} onClick={() => setMuView('venue')}>Por Jogo/Sede</SB>
              <SB active={muView === 'elo'} onClick={() => setMuView('elo')}>Elo Jogos</SB>
              <SB active={muView === 'duel'} onClick={() => setMuView('duel')}>Duelo</SB>
              <SB active={muView === 'cutoff'} onClick={() => setMuView('cutoff')}>Corte 3°</SB>
              <SB active={muView === 'scores'} onClick={() => setMuView('scores')}>Placares</SB>
              <SB active={muView === 'tie'} onClick={() => setMuView('tie')}>Desempate</SB>
              <SB active={muView === 'path'} onClick={() => setMuView('path')}>Path</SB>
              <SB active={muView === 'surpresas'} onClick={() => setMuView('surpresas')}>Surpresas</SB>
              <SB active={muView === 'evolucao'} onClick={() => setMuView('evolucao')}>Evolução</SB>
              <SB active={muView === 'confed'} onClick={() => setMuView('confed')}>Confederações</SB>
            </div>
            {baseAgg && ['round', 'team', 'pos', 'combos', 'venue', 'duel'].includes(muView) && (
              <div style={{ fontSize: '9px', color: dm, marginBottom: '8px' }}>Os marcadores <span style={{ color: gn, fontWeight: 700 }}>▲</span>/<span style={{ color: rd, fontWeight: 700 }}>▼</span> mostram a variação em p.p. <strong style={{ color: tx }}>desde o início da Copa</strong> (vs simulação pré-Copa, sem resultados{dynElo ? ', já incluindo o efeito do Elo dinâmico' : ''}). Aparecem no modo absoluto.</div>
            )}

            {muView === 'confed' && (() => {
              const sortFns = { aprov: (a, b) => (b.aprov ?? -1) - (a.aprov ?? -1), dpts: (a, b) => b.dPts - a.dPts, elo: (a, b) => b.elo - a.elo, orig: (a, b) => b.eloOrig - a.eloOrig };
              const rows = confedStats.slice().sort(sortFns[confedSort] || sortFns.aprov);
              const totals = rows.reduce((s, r) => ({ n: s.n + r.n, w: s.w + r.w, d: s.d + r.d, l: s.l + r.l }), { n: 0, w: 0, d: 0, l: 0 });
              return (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: bl, marginBottom: '4px' }}>🌍 Desempenho por confederação</div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '8px', lineHeight: 1.5, maxWidth: '760px' }}>Resumo dos jogos já disputados {confedNoIntra ? <strong style={{ color: acc }}>(só confrontos entre confederações diferentes)</strong> : '(fase de grupos + mata-mata)'}. <strong>Aproveitamento</strong> = pontos obtidos / disputáveis. <strong>Elo ±</strong> = Elo ganho/perdido vs expectativa inicial (K={DYN_K}); <strong>Δ pts</strong> = pontos reais − esperados pelo modelo.</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setConfedNoIntra(v => !v)} style={{ padding: '4px 9px', fontSize: '10px', fontWeight: 700, background: confedNoIntra ? `${acc}33` : card, color: confedNoIntra ? acc : dm, border: `1px solid ${confedNoIntra ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }} title="Desconsidera jogos entre dois times da mesma confederação (ex.: UEFA × UEFA)">{confedNoIntra ? '🚫 sem intra-confed' : 'incluir intra-confed'}</button>
                    <span style={{ fontSize: '9px', color: dm, marginLeft: '4px' }}>Ordenar:</span>
                    {[['aprov', 'Aproveitamento'], ['dpts', 'Δ pts'], ['elo', 'Elo ±'], ['orig', 'Elo médio']].map(([k, l]) => <SB key={k} active={confedSort === k} onClick={() => setConfedSort(k)}>{l}</SB>)}
                  </div>
                  {totals.n === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: dm, fontSize: '11px' }}>{confedNoIntra ? 'Nenhum confronto entre confederações diferentes ainda.' : 'Preencha resultados para ver o desempenho por confederação.'}</div> : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', fontSize: '11px', minWidth: '620px' }}>
                        <thead><tr>{['Confederação', 'Times', 'Jogos', 'V', 'E', 'D', 'Gols', 'Aprov.', 'Elo méd. orig.', 'Elo ±', 'Δ pts vs esper.'].map((h, i) => (
                          <th key={h} style={{ padding: '5px 8px', textAlign: i === 0 ? 'left' : 'right', color: dm, fontSize: '9px', fontWeight: 600, borderBottom: `1px solid ${bd}` }}>{h}</th>
                        ))}</tr></thead>
                        <tbody>{rows.map(r => (
                          <tr key={r.conf}>
                            <td style={{ padding: '4px 8px', fontWeight: 700, color: tx }}>{r.conf}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: dm }}>{r.nTeams}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: r.n ? tx : dm }}>{r.n}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: gn, fontWeight: 600 }}>{r.w}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: dm }}>{r.d}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: rd, fontWeight: 600 }}>{r.l}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: dm }}>{r.gf}:{r.ga}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: r.aprov == null ? dm : r.aprov >= 60 ? gn : r.aprov >= 40 ? acc : rd }}>{r.aprov == null ? '—' : r.aprov.toFixed(0) + '%'}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', color: bl, fontWeight: 600 }}>{r.eloOrig}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: r.n === 0 ? dm : Math.abs(r.elo) < 0.5 ? dm : r.elo > 0 ? gn : rd }}>{r.n === 0 ? '—' : (r.elo > 0 ? '+' : '') + Math.round(r.elo)}</td>
                            <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, color: r.n === 0 ? dm : Math.abs(r.dPts) < 0.3 ? dm : r.dPts > 0 ? gn : rd }}>{r.n === 0 ? '—' : (r.dPts > 0 ? '+' : '') + r.dPts.toFixed(1)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ fontSize: '9px', color: dm, marginTop: '8px', maxWidth: '760px', lineHeight: 1.4 }}>Δ pts e Elo ± positivos = a confederação <strong style={{ color: gn }}>superou</strong> a expectativa inicial; negativos = ficou <strong style={{ color: rd }}>abaixo</strong>. Mata-mata contabilizado pelo placar de 90′ (pênaltis não contam como V/D aqui).</div>
                </div>
              );
            })()}

            {muView === 'evolucao' && (() => {
              const teamsG = groups[evoGrp];
              const tbl = evoAll[evoGrp];
              const ready = !!tbl;
              const M = evoTblMetric;
              return (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: bl, marginBottom: '4px' }}>📈 Evolução do grupo jogo a jogo</div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '8px', lineHeight: 1.5, maxWidth: '760px' }}>Como as chances de cada time do grupo mudam à medida que os jogos <strong style={{ color: tx }}>preenchidos</strong> daquele grupo vão acontecendo (demais resultados mantidos). Cada coluna roda um Monte Carlo completo, então cobre tanto a posição no grupo (1º–4º, avança) quanto as fases do mata-mata (R16…Campeão).</div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: dm }}>Grupo:</span>
                    {Object.keys(groups).map(g => <SB key={g} active={evoGrp === g} onClick={() => setEvoGrp(g)}>{g}</SB>)}
                  </div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: dm }}>Métrica:</span>
                    {EVO_METRICS.map(([k, l]) => <button key={k} onClick={() => setEvoTblMetric(k)} style={{ padding: '2px 7px', fontSize: '10px', fontWeight: M === k ? 700 : 400, background: M === k ? `${acc}33` : 'transparent', color: M === k ? acc : dm, border: `1px solid ${M === k ? acc : bd}`, borderRadius: '4px', cursor: 'pointer' }}>{l}</button>)}
                    <button onClick={precomputeEvoAll} disabled={!!evoAllProg || evoTblLoading} title="Calcula a evolução de todos os 12 grupos (pode levar alguns segundos)" style={{ marginLeft: '6px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, color: '#000', background: gd, border: 'none', borderRadius: '4px', cursor: evoAllProg ? 'wait' : 'pointer' }}>{evoAllProg ? `⏳ ${evoAllProg.done}/${evoAllProg.total}` : '📊 calcular evolução (12 grupos)'}</button>
                    <button onClick={() => computeGroupEvo(evoGrp)} disabled={evoTblLoading || !!evoAllProg} title="Recalcula só este grupo" style={{ padding: '4px 10px', fontSize: '10px', fontWeight: 700, color: '#000', background: acc, border: 'none', borderRadius: '4px', cursor: evoTblLoading ? 'wait' : 'pointer' }}>{evoTblLoading ? '⏳…' : `↻ só ${evoGrp}`}</button>
                  </div>
                  {!ready ? <div style={{ padding: '24px', textAlign: 'center', color: dm, fontSize: '11px' }}>{evoTblLoading || evoAllProg ? 'Rodando snapshots…' : 'Clique em "📊 calcular evolução (12 grupos)" para gerar a tabela (não roda automático para não pesar após cada simulação).'}</div> : (() => {
                    const snaps = tbl.snaps;
                    const mLabel = EVO_METRICS.find(([k]) => k === M)?.[1] || M;
                    return (
                      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                        <div style={{ fontSize: '9px', color: dm, marginBottom: '4px' }}>Grupo {tbl.gn} • métrica: <strong style={{ color: acc }}>{mLabel}</strong> (% por time) • {tbl.sims.toLocaleString()} sims/coluna • {snaps.length} coluna(s){snaps.length === 1 ? ' — preencha jogos deste grupo para ver a evolução' : ''}</div>
                        <table style={{ borderCollapse: 'collapse', fontSize: '11px', minWidth: '320px' }}>
                          <thead><tr>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: dm, fontSize: '9px', fontWeight: 600, borderBottom: `1px solid ${bd}`, position: 'sticky', left: 0, background: card }}>Time</th>
                            {snaps.map((s, i) => {
                              const sub = s.idx != null ? `${nm(groups[GS[s.idx][0]][GS[s.idx][1]]).slice(0, 3)}×${nm(groups[GS[s.idx][0]][GS[s.idx][2]]).slice(0, 3)}` : 'pré';
                              return <th key={i} title={s.idx != null ? `${GS[s.idx][3]} • ${nm(groups[GS[s.idx][0]][GS[s.idx][1]])} × ${nm(groups[GS[s.idx][0]][GS[s.idx][2]])}` : 'antes de qualquer jogo do grupo'} style={{ textAlign: 'right', padding: '4px 8px', color: dm, fontSize: '9px', fontWeight: 600, borderBottom: `1px solid ${bd}`, minWidth: '48px' }}>{s.label}<div style={{ fontSize: '7px', color: `${dm}aa`, fontWeight: 400 }}>{sub}</div></th>;
                            })}
                          </tr></thead>
                          <tbody>{teamsG.map(t => (
                            <tr key={t}>
                              <td style={{ padding: '3px 8px', fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: card }}>{fl(t)} {nm(t)}</td>
                              {snaps.map((s, i) => (
                                <td key={i} style={{ padding: '3px 8px', textAlign: 'right', fontWeight: 700, color: tx }}>{(s.probs[t]?.[M] ?? 0).toFixed(0)}%</td>
                              ))}
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {muView === 'surpresas' && (() => {
              // Coleta todos os resultados preenchidos (GS + KO) com surpresa analítica pré-jogo.
              // Acrescenta dados de calibração: acerto do 1X2 (resultado mais provável aconteceu?),
              // prob. do favorito do modelo e acerto do placar exato (moda).
              // Baseline "sem informação dos times" para o PLACAR: Poisson de um jogo médio
              // equilibrado (Elo igual, sem tilt) — o análogo do chute uniforme 1X2, mas no placar.
              const { la: la0, lb: lb0 } = cL(1700, 1700, 0);
              const naiveScoreBits = (gA, gB) => -Math.log2(Math.max(pp(la0, gA) * pp(lb0, gB), 1e-12));
              const calib = (eH, eA, h, a, gA, gB) => {
                const s = surpriseOf(eH, eA, h, a, gA, gB);
                const pr = mProbs(eH, eA, h, a);
                const pTop = Math.max(pr.pH, pr.pD, pr.pA) / 100; // prob do desfecho mais provável (favorito)
                const pAct = (gA > gB ? pr.pH : gA < gB ? pr.pA : pr.pD) / 100;
                const ms = modeScore(eH, eA, h, a);
                return { ...s, pTop, hit: pAct >= pTop - 1e-9, modeHit: ms.a === gA && ms.b === gB, naiveScoreBits: naiveScoreBits(gA, gB) };
              };
              const rows = [];
              GS.forEach(([g, hi, ai, date, city], idx) => {
                const fx = userRes[idx];
                if (fx?.gA == null || fx?.gB == null) return;
                const h = groups[g][hi], a = groups[g][ai];
                const _im = injuries[idx] || {};
                const s = calib(efCity(h, city) - (_im.h || 0) * INJ_ELO, efCity(a, city) - (_im.a || 0) * INJ_ELO, h, a, fx.gA, fx.gB);
                rows.push({ key: String(idx), label: 'J' + (idx + 1), fase: 'Grupo ' + g, h, a, gA: fx.gA, gB: fx.gB, tie: false, ...s });
              });
              const stgS = resolveStandings(groups, userRes);
              const koS = resolveKO(stgS, userRes);
              for (let mn = 73; mn <= 104; mn++) {
                const fx = userRes['k' + mn];
                if (fx?.gA == null || fx?.gB == null) continue;
                const m = koS[mn];
                if (!m?.h || !m?.a) continue;
                const s = calib(efCity(m.h, KO_CITY[mn]), efCity(m.a, KO_CITY[mn]), m.h, m.a, fx.gA, fx.gB);
                rows.push({ key: 'k' + mn, label: 'M' + mn, fase: m.l, h: m.h, a: m.a, gA: fx.gA, gB: fx.gB, tie: fx.gA === fx.gB, pw: fx.pw, ...s });
              }
              // Calibração agregada do modelo vs acaso (chute uniforme 1X2 = log2(3) ≈ 1.585 bits).
              const N = rows.length;
              const avgOut = N ? rows.reduce((s, r) => s + r.bitsOut, 0) / N : 0; // surpresa média do resultado
              const RAND = Math.log2(3);
              const gainBits = RAND - avgOut; // >0 = melhor que o acaso
              const skill = RAND > 0 ? gainBits / RAND * 100 : 0; // % de surpresa removida vs acaso
              const hitN = rows.filter(r => r.hit).length, hitRate = N ? hitN / N * 100 : 0;
              const expHit = N ? rows.reduce((s, r) => s + r.pTop, 0) / N * 100 : 0; // taxa de acerto esperada (calibração)
              const modeN = rows.filter(r => r.modeHit).length;
              // Calibração do PLACAR: surpresa média do placar exato vs baseline sem info de time.
              const avgScore = N ? rows.reduce((s, r) => s + r.bitsExact, 0) / N : 0;
              const avgNaiveScore = N ? rows.reduce((s, r) => s + r.naiveScoreBits, 0) / N : 0;
              const gainScore = avgNaiveScore - avgScore; // >0 = modelo prevê placares melhor que o jogo-médio
              const skillScore = avgNaiveScore > 0 ? gainScore / avgNaiveScore * 100 : 0;
              rows.forEach(r => {
                r.imp = qualImpact(r.key);
                r.mag = r.imp ? (r.imp.type === 'ko' ? r.imp.dW : Math.abs(r.imp.headline.dAdv)) : -1;
              });
              const sorted = [...rows].sort((x, y) => surSort === 'impact' ? (y.mag - x.mag) || (y.bitsExact - x.bitsExact)
                : surSort === 'bitsOut' ? (y.bitsOut - x.bitsOut) || (y.bitsExact - x.bitsExact)
                : y.bitsExact - x.bitsExact);
              return (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: acc, marginBottom: '4px' }}>📰 Resultados inseridos — surpresa & impacto na classificação</div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '8px', lineHeight: 1.5, maxWidth: '760px' }}><strong style={{ color: tx }}>Surpresa</strong> em bits (−log₂ P; cada +1 bit = metade da chance), em duas medidas: <strong style={{ color: acc }}>placar</strong> = quão improvável era aquele placar exato; <strong style={{ color: bl }}>resultado</strong> = quão improvável era o desfecho 1X2 (quem venceu/empatou — a "zebra"). <strong style={{ color: tx }}>Impacto</strong> = quanto o resultado moveu a chance de <em>classificação</em> dos times do grupo (mini-MC pareado só do grupo, sementes idênticas — sem ruído) ou, no mata-mata, a chance de <em>avanço</em> do vencedor (analítico). Sempre incondicional, ignora filtros.</div>
                  {rows.length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: dm, fontSize: '11px' }}>Nenhum resultado preenchido — preencha na aba 📝 Resultados.</div> : <>
                    {/* Calibração: o modelo está acertando melhor que o acaso? */}
                    <div style={{ marginBottom: '10px', padding: '8px 10px', background: card, borderRadius: '6px', border: `1px solid ${gainBits > 0 ? gn + '55' : bd}`, maxWidth: '760px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: gainBits > 0 ? gn : rd, marginBottom: '5px' }}>📏 Precisão do modelo vs acaso {N < 8 ? <span style={{ fontSize: '8px', color: dm, fontWeight: 400 }}>(amostra pequena: {N} jogo{N > 1 ? 's' : ''} — ainda ruidoso)</span> : <span style={{ fontSize: '8px', color: dm, fontWeight: 400 }}>({N} jogos)</span>}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px' }}>
                        <div title="Em quantos % dos jogos o desfecho 1X2 mais provável do modelo realmente aconteceu. 'Esperado' = média da prob. do favorito do modelo — se baterem, o modelo está bem calibrado.">
                          <div style={{ fontSize: '8px', color: dm }}>Acerto do resultado (1X2)</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: tx }}>{hitRate.toFixed(0)}% <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>({hitN}/{N}) · esperado {expHit.toFixed(0)}%</span></div>
                        </div>
                        <div title="Surpresa média do modelo sobre o resultado ocorrido (−log₂ da prob. que o modelo deu). Menor = melhor. O acaso (chute uniforme V/E/D) tem 1,58 bits/jogo fixos.">
                          <div style={{ fontSize: '8px', color: dm }}>Surpresa média (resultado)</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: avgOut < RAND ? gn : rd }}>{avgOut.toFixed(2)} <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>bits/jogo · acaso 1,58</span></div>
                        </div>
                        <div title="Quanto da incerteza do chute aleatório o modelo eliminou: (1,58 − surpresa do modelo) / 1,58. Positivo = o modelo é informativo; 0% = igual ao acaso; negativo = pior que chutar.">
                          <div style={{ fontSize: '8px', color: dm }}>Ganho sobre o acaso</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: gainBits > 0.02 ? gn : gainBits < -0.02 ? rd : dm }}>{gainBits > 0 ? '+' : ''}{gainBits.toFixed(2)} bits <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>({skill > 0 ? '+' : ''}{skill.toFixed(0)}%)</span></div>
                        </div>
                        <div title="Em quantos jogos o placar exato mais provável do modelo (a moda) bateu certo. Difícil por natureza — placares têm muita variância.">
                          <div style={{ fontSize: '8px', color: dm }}>Placar exato (moda)</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: tx }}>{modeN}/{N} <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>jogos</span></div>
                        </div>
                        <div title="Surpresa média do modelo sobre o PLACAR exato ocorrido. Baseline = um jogo médio equilibrado (Elo igual, sem tilt), o análogo do chute uniforme mas para o placar. Menor = melhor.">
                          <div style={{ fontSize: '8px', color: dm }}>Surpresa média (placar)</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: avgScore < avgNaiveScore ? gn : rd }}>{avgScore.toFixed(2)} <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>bits/jogo · jogo-médio {avgNaiveScore.toFixed(2)}</span></div>
                        </div>
                        <div title="Quanto o modelo prevê o PLACAR melhor que um jogo médio sem informação dos times: (surpresa jogo-médio − surpresa modelo) / surpresa jogo-médio. Positivo = a informação de Elo/tilt ajuda a prever o placar.">
                          <div style={{ fontSize: '8px', color: dm }}>Ganho no placar</div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: gainScore > 0.02 ? gn : gainScore < -0.02 ? rd : dm }}>{gainScore > 0 ? '+' : ''}{gainScore.toFixed(2)} bits <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>({skillScore > 0 ? '+' : ''}{skillScore.toFixed(0)}%)</span></div>
                        </div>
                      </div>
                      <div style={{ fontSize: '8px', color: dm, marginTop: '6px', lineHeight: 1.4 }}>{gainBits > 0.02 ? `O modelo está ${skill.toFixed(0)}% melhor que chutar V/E/D no acaso (resultado)` : gainBits < -0.02 ? 'O modelo está pior que o acaso no resultado nestes jogos (zebras concentradas ou poucos jogos)' : 'O modelo está empatado com o acaso no resultado aqui'}; no placar, {gainScore > 0.02 ? `${skillScore.toFixed(0)}% melhor` : gainScore < -0.02 ? 'pior' : 'empatado'} que um jogo médio sem info de time. Tudo medido sem o modelo ver o resultado (90 min).</div>
                    </div>
                    <div style={{ marginBottom: '10px', border: `1px solid ${surModels ? bl : bd}55`, borderRadius: '6px', overflow: 'hidden' }}>
                      <div onClick={() => setSurModels(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', background: `${bl}10`, cursor: 'pointer' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: bl }}>{surModels ? '▾' : '▸'} 🔬 Comparar modelos (qual previu melhor os jogos já realizados)</span>
                        <span style={{ fontSize: '9px', color: dm, marginLeft: 'auto' }}>Brier / log-loss por rating × tilt × favoritismo × mando</span>
                      </div>
                      {surModels && <div style={{ padding: '10px' }}>{renderModelBacktest()}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', color: dm }}>Ordenar:</span>
                      <SB active={surSort === 'bits'} onClick={() => setSurSort('bits')}>↓ Surpresa placar</SB>
                      <SB active={surSort === 'bitsOut'} onClick={() => setSurSort('bitsOut')}>↓ Surpresa resultado</SB>
                      <SB active={surSort === 'impact'} onClick={() => setSurSort('impact')}>↓ Impacto</SB>
                      <span style={{ fontSize: '9px', color: dm }}>{rows.length} resultado(s)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 52px 52px 84px 116px 22px', gap: '4px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 8px 3px', maxWidth: '860px' }}>
                      <span>#</span><span>Jogo</span><span style={{ textAlign: 'right' }} title="Prob. pré-jogo do desfecho 1X2 ocorrido (90')">P(1X2)</span><span style={{ textAlign: 'right' }} title="Prob. pré-jogo do placar exato (90')">P(placar)</span><span style={{ textAlign: 'right' }} title="Surpresa em bits: placar exato · resultado (1X2). Maior = mais raro.">Surpresa <span style={{ color: acc }}>placar</span>·<span style={{ color: bl }}>result.</span></span><span style={{ textAlign: 'right' }} title="GS: Δ chance de classificação do time mais afetado do grupo. KO: Δ chance de avanço do vencedor (analítico).">Impacto classif.</span><span />
                    </div>
                    <div style={{ maxWidth: '860px' }}>
                      {sorted.map((r, i) => {
                        const im = r.imp;
                        const isExp = surExpand === r.key;
                        return (
                          <div key={r.key} style={{ background: i % 2 === 0 ? card : '#0d111d', borderRadius: '4px', marginBottom: '2px', padding: '4px 8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr 52px 52px 84px 116px 22px', gap: '4px', alignItems: 'center', fontSize: '10px' }}>
                              <span style={{ color: dm, fontSize: '9px' }}>{r.label}</span>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><span style={{ color: bl, fontSize: '8px', marginRight: '4px' }}>{r.fase}</span>{fl(r.h)} {nm(r.h)} <strong>{r.gA}×{r.gB}</strong> {fl(r.a)} {nm(r.a)}{r.tie && r.pw ? <span style={{ color: dm, fontSize: '8px' }}> (pên: {r.pw === 'B' ? nm(r.a) : nm(r.h)})</span> : ''}</span>
                              <span style={{ textAlign: 'right', color: dm }}>{(r.pOut * 100).toFixed(0)}%</span>
                              <span style={{ textAlign: 'right', color: dm }}>{(r.pExact * 100).toFixed(1)}%</span>
                              <span style={{ textAlign: 'right', fontWeight: 700 }} title={`placar ${r.bitsExact.toFixed(1)} bits (${(r.pExact * 100).toFixed(1)}%) · resultado ${r.bitsOut.toFixed(1)} bits (${(r.pOut * 100).toFixed(0)}%)`}><span style={{ color: r.bitsExact > 6 ? rd : r.bitsExact > 4.5 ? '#f97316' : acc }}>{r.bitsExact.toFixed(1)}</span><span style={{ color: dm, fontWeight: 400 }}> · </span><span style={{ color: r.bitsOut > 6 ? rd : r.bitsOut > 4.5 ? '#f97316' : bl }}>{r.bitsOut.toFixed(1)}</span></span>
                              {im ? <span style={{ textAlign: 'right', fontWeight: 700, color: r.mag > 15 ? rd : r.mag > 5 ? '#f97316' : dm }}>⚡ {im.type === 'ko' ? `${nm(im.winner)} +${im.dW.toFixed(1)}` : `${nm(im.headline.t)} ${im.headline.dAdv > 0 ? '+' : ''}${im.headline.dAdv.toFixed(1)}`} p.p.</span>
                                : <span style={{ textAlign: 'right', color: dm }}>—</span>}
                              <button onClick={() => setSurExpand(isExp ? null : r.key)} disabled={!im} style={{ background: 'transparent', border: 'none', color: im ? acc : `${dm}55`, cursor: im ? 'pointer' : 'default', fontSize: '10px', padding: 0 }}>{isExp ? '▲' : '▼'}</button>
                            </div>
                            {isExp && im && im.type === 'gs' && (
                              <div style={{ marginTop: '4px', padding: '5px 8px', background: '#0a0e18', borderRadius: '4px', border: `1px solid ${bd}` }}>
                                <div style={{ fontSize: '8px', color: dm, fontWeight: 600, marginBottom: '3px' }}>Δ probabilidade de posição no grupo {im.gn} causado por este resultado ({im.n.toLocaleString()} pares de mini-sims do grupo, sementes idênticas). Avança = Δ1º + Δ2º + {(im.q * 100).toFixed(0)}%·Δ3º.</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 84px', gap: '4px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 0 2px', borderBottom: `1px solid ${bd}` }}>
                                  <span>Time</span><span style={{ textAlign: 'right' }}>Δ1º</span><span style={{ textAlign: 'right' }}>Δ2º</span><span style={{ textAlign: 'right' }}>Δ3º</span><span style={{ textAlign: 'right' }}>Δ Avança</span>
                                </div>
                                {im.movers.map(mv => (
                                  <div key={mv.t} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px 84px', gap: '4px', fontSize: '10px', padding: '1px 0' }}>
                                    <span>{fl(mv.t)} {nm(mv.t)}</span>
                                    {[mv.dP1, mv.dP2, mv.dP3].map((v, k) => <span key={k} style={{ textAlign: 'right', color: v > 0.05 ? gn : v < -0.05 ? rd : dm }}>{v > 0 ? '+' : ''}{v.toFixed(1)}</span>)}
                                    <span style={{ textAlign: 'right', fontWeight: 700, color: mv.dAdv > 0.05 ? gn : mv.dAdv < -0.05 ? rd : dm }}>{mv.dAdv > 0 ? '+' : ''}{mv.dAdv.toFixed(1)} p.p.</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {isExp && im && im.type === 'ko' && (
                              <div style={{ marginTop: '4px', padding: '5px 8px', background: '#0a0e18', borderRadius: '4px', border: `1px solid ${bd}` }}>
                                <div style={{ fontSize: '8px', color: dm, fontWeight: 600, marginBottom: '3px' }}>Chance de avançar antes do jogo (analítico: 90' + prorrogação + pênaltis) → depois do resultado.</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 84px', gap: '4px', fontSize: '10px', padding: '1px 0' }}>
                                  <span>{fl(im.winner)} {nm(im.winner)}</span>
                                  <span style={{ textAlign: 'right', color: dm }}>{im.pAdvW.toFixed(1)}% → 100%</span>
                                  <span style={{ textAlign: 'right', fontWeight: 700, color: gn }}>+{im.dW.toFixed(1)} p.p.</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 84px', gap: '4px', fontSize: '10px', padding: '1px 0' }}>
                                  <span>{fl(im.loser)} {nm(im.loser)}</span>
                                  <span style={{ textAlign: 'right', color: dm }}>{(100 - im.pAdvW).toFixed(1)}% → 0%</span>
                                  <span style={{ textAlign: 'right', fontWeight: 700, color: rd }}>−{im.dW.toFixed(1)} p.p.</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '8px', color: dm, marginTop: '6px', lineHeight: 1.5, maxWidth: '760px' }}>Surpresa e P(·) referem-se aos 90 minutos (no mata-mata, pênaltis não entram na conta). O impacto GS usa {(10000).toLocaleString()} pares de mini-simulações só do grupo com sementes idênticas — determinístico e sem ruído; Δ Avança pondera o 3º lugar por q = P(3º do grupo avançar) do último Monte Carlo (sem MC: 8/12). O impacto KO é analítico e exato no modelo (90' + prorrogação + pênaltis).</div>
                  </>}
                </div>
              );
            })()}

            {muView === 'round' && (<>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {[['r32', '🏟️ R32'], ['r16', '⚔️ R16'], ['qf', '🔥 QF'], ['sf', '🌟 SF'], ['fin', '🏆 Final']].map(([id, l]) => (
                  <SB key={id} active={muRound === id} onClick={() => setMuRound(id)}>{l}</SB>
                ))}
              </div>
              <div style={{ display: 'grid', gap: '3px', maxWidth: '600px' }}>
                {(muPct[muRound] || []).slice(0, 20).map((m, i) => {
                  const maxP = (muPct[muRound] || [])[0]?.pct || 1;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', alignItems: 'center', padding: '4px 8px', background: i < 3 ? `${gd}08` : i % 2 === 0 ? card : '#0d111d', borderRadius: '4px' }}>
                      <span style={{ fontSize: '10px', color: i < 3 ? gd : dm }}>#{i + 1}</span>
                      <span style={{ fontSize: '11px' }}>{fl(m.a)} {nm(m.a)} <span style={{ color: dm }}>vs</span> {fl(m.b)} {nm(m.b)}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: i < 3 ? gd : acc, minWidth: '42px', textAlign: 'right' }}>{m.pct.toFixed(1)}%{dTag(m.pct, basePairPct(baseAgg?.muPct?.[muRound], m.a, m.b))}</span>
                    </div>
                  );
                })}
              </div>
            </>)}

            {muView === 'team' && tmPct && (<>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                <select value={selTeam} onChange={e => setSelTeam(e.target.value)} style={{ padding: '6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
                  {all.sort((a, b) => (FP[b] || 0) - (FP[a] || 0)).map(t => <option key={t} value={t}>{nm(t)}</option>)}
                </select>
                <SB active={tmMode === 'team'} onClick={() => setTmMode('team')}>vs Seleção</SB>
                <SB active={tmMode === 'pos'} onClick={() => setTmMode('pos')}>vs Posição</SB>
                <SB active={tmMode === 'game'} onClick={() => setTmMode('game')}>Por Jogo</SB>
                <span style={{ color: dm, fontSize: '9px' }}>|</span>
                <SB active={!condMode} onClick={() => setCondMode(false)}>Absoluto</SB>
                <SB active={condMode} onClick={() => setCondMode(true)}>Condicional</SB>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>{fl(selTeam)} {nm(selTeam)} <span style={{ color: dm, fontSize: '11px' }}>({rt(selTeam)} pts)</span></div>
              {(tmMode === 'team' || tmMode === 'pos') && (() => {
                const teamGrp2 = Object.entries(groups).find(([,ts]) => ts.includes(selTeam));
                const grpName2 = teamGrp2?.[0] || '?';
                const teamPositions2 = posWho ? Object.entries(posWho).filter(([,t]) => t[selTeam]).map(([p, t]) => [p, t[selTeam]||0]).sort((a,b) => b[1]-a[1]) : [];
                const activePos2 = gamePos && gamePos.startsWith(grpName2) ? gamePos : '';

                return <div>
                  {(tmMode === 'team' || tmMode === 'pos') && <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', color: dm }}>Filtrar posição:</span>
                    <select value={activePos2} onChange={e => setGamePos(e.target.value)} style={{ padding: '3px 6px', background: card, color: activePos2 ? bl : dm, border: `1px solid ${activePos2 ? bl : bd}`, borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                      <option value="">Todas</option>
                      {teamPositions2.map(([p, c]) => <option key={p} value={p}>{p} ({(c/ mcN*100).toFixed(0)}%)</option>)}
                    </select>
                    <span style={{ fontSize: '10px', color: gd, fontWeight: 600 }}>🏆 {activePos2 && tpcData?.[selTeam]?.[activePos2] ? ((tpcData[selTeam][activePos2].ch / tpcData[selTeam][activePos2].n) * 100).toFixed(1) : (res?.[selTeam]?.ch || 0).toFixed(1)}%</span>
                  </div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '8px' }}>
                {['r32', 'r16', 'qf', 'sf', 'fin'].map(rd => {
                  const teamPct = res?.[selTeam]?.[rd] || 0;
                  const labels = { r32: 'R32', r16: 'R16 (Oitavas)', qf: 'Quartas', sf: 'Semifinais', fin: 'Final' };
                  let items = [];
                  let denom = teamPct; // denominator for conditional
                  let avgElo = 0;
                  if (tmMode === 'team') {
                    if (activePos2 && tpcData?.[selTeam]?.[activePos2]) {
                      const condData = tpcData[selTeam][activePos2];
                      const condN = condData.n;
                      const raw = Object.entries(condData[rd] || {});
                      items = raw.map(([t, c]) => ({ label: `${fl(t)} ${nm(t)}`, pct: (c / mcN) * 100, team: t })).sort((a,b) => b.pct - a.pct).slice(0, 20);
                      denom = items.reduce((s,x) => s + x.pct, 0);
                      const totalC = raw.reduce((s,[,c])=>s+c, 0);
                      if (totalC > 0) avgElo = raw.reduce((s,[t,c])=>s+rt(t)*c, 0) / totalC;
                    } else {
                      const oppList = tmPct[selTeam]?.[rd] || [];
                      items = oppList.slice(0, 20).map(x => ({ label: `${fl(x.o)} ${nm(x.o)}`, pct: x.pct, team: x.o }));
                      const totalC = oppList.reduce((s,x)=>s+x.pct, 0);
                      if (totalC > 0) avgElo = oppList.reduce((s,x)=>s+rt(x.o)*x.pct, 0) / totalC;
                    }
                  } else {
                    if (activePos2 && posTm?.[rd]?.[activePos2]) {
                      items = Object.entries(posTm[rd][activePos2]).map(([p, c]) => ({ label: p, pct: (c / mcN) * 100 })).sort((a, b) => b.pct - a.pct).slice(0, 20);
                      denom = items.reduce((s,x) => s + x.pct, 0);
                    } else {
                      const posD = tmPosData?.[selTeam]?.[rd] || {};
                      items = Object.entries(posD).map(([p, c]) => ({ label: p, pct: (c / mcN) * 100 })).sort((a, b) => b.pct - a.pct).slice(0, 20);
                    }
                    // Compute avgElo from posVsTm for this team
                    const pv = posVsTmData?.[rd];
                    if (pv) {
                      const posKey = activePos2 || Object.keys(pv).find(pk => pk.startsWith(grpName2));
                      if (posKey && pv[posKey]) {
                        const raw = Object.entries(pv[posKey]).filter(([t])=>t!==selTeam);
                        const totalC = raw.reduce((s,[,c])=>s+c, 0);
                        if (totalC > 0) avgElo = raw.reduce((s,[t,c])=>s+rt(t)*c, 0) / totalC;
                      }
                    }
                  }
                  if (!items.length) return null;
                  return (
                    <div key={rd} style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{labels[rd]}{avgElo > 0 && <span style={{ fontSize: '8px', color: dm, fontWeight: 400, marginLeft: '4px' }}>~{Math.round(avgElo)}</span>}</span>
                        <span style={{ color: denom > 50 ? '#22c55e' : denom > 20 ? '#c9a84c' : '#ef4444', fontSize: '10px' }}>Chega: {denom.toFixed(1)}%{!condMode && !activePos2 && dTag(denom, baseAgg?.p?.[selTeam]?.[rd])}</span>
                      </div>
                      {items.map((x, i) => {
                        const display = condMode && denom > 0 ? (x.pct / denom * 100) : x.pct;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
                            <span style={tmMode === 'pos' ? { fontFamily: 'monospace', color: bl } : {}}><span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span>{x.label}</span>
                            <span style={{ color: acc, fontWeight: 600 }}>{display.toFixed(1)}%{!condMode && tmMode === 'team' && !activePos2 && x.team && dTag(x.pct, (baseAgg?.tmPct?.[selTeam]?.[rd] || []).find(o => o.o === x.team)?.pct ?? 0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }).filter(Boolean)}
              </div></div>;
              })()}
              {tmMode === 'game' && (() => {
                const teamGrp = Object.entries(groups).find(([,ts]) => ts.includes(selTeam));
                const grpName = teamGrp?.[0] || '?';
                const grpGames = teamGrp ? GS.map(([gn, hi, ai, date, city], idx) => {
                  if (gn !== grpName) return null;
                  const h = groups[gn][hi], a = groups[gn][ai];
                  if (h !== selTeam && a !== selTeam) return null;
                  const opp = h === selTeam ? a : h;
                  return { date, city, brt: GS_BRT[idx], opp, label: `${fl(opp)} ${nm(opp)}` };
                }).filter(Boolean) : [];
                const teamPositions = posWho ? Object.entries(posWho).filter(([,t]) => t[selTeam]).map(([p, t]) => [p, t[selTeam]||0]).sort((a,b) => b[1]-a[1]) : [];
                const bestPos = teamPositions[0];
                const activePos = gamePos && gamePos.startsWith(grpName) ? gamePos : '';
                const posN = activePos && tpcData?.[selTeam]?.[activePos] ? tpcData[selTeam][activePos].n : 0;

                const MG = [
                  ['R32','r32',[[73,'28/Jun','Los Angeles'],[74,'29/Jun','Boston'],[75,'29/Jun','Monterrey'],[76,'29/Jun','Houston'],[77,'30/Jun','Nova York/NJ'],[78,'30/Jun','Dallas'],[79,'30/Jun','Cd. México'],[80,'1/Jul','Atlanta'],[81,'1/Jul','Filadélfia'],[82,'1/Jul','Seattle'],[83,'2/Jul','Los Angeles'],[84,'2/Jul','Guadalajara'],[85,'2/Jul','Miami'],[86,'3/Jul','S. Francisco'],[87,'3/Jul','Dallas'],[88,'3/Jul','Kansas City']]],
                  ['R16','r16',[[89,'4/Jul','Filadélfia'],[90,'4/Jul','Houston'],[91,'5/Jul','Nova York/NJ'],[92,'5/Jul','Cd. México'],[93,'6/Jul','Dallas'],[94,'6/Jul','Seattle'],[95,'7/Jul','Atlanta'],[96,'7/Jul','Vancouver']]],
                  ['QF','qf',[[97,'9/Jul','Boston'],[98,'10/Jul','Los Angeles'],[99,'10/Jul','Miami'],[100,'11/Jul','Kansas City']]],
                  ['SF','sf',[[101,'14/Jul','Dallas'],[102,'15/Jul','Atlanta']]],
                  ['3°/4°','p34',[[103,'18/Jul','Miami']]],
                  ['Final','fin',[[104,'19/Jul','MetLife']]],
                ];
                return (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: dm }}>Posição:</span>
                      <select value={activePos} onChange={e => setGamePos(e.target.value)} style={{ padding: '3px 6px', background: card, color: activePos ? bl : dm, border: `1px solid ${activePos ? bl : bd}`, borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                        <option value="">Todas ({bestPos ? bestPos[0] + ' ' + (bestPos[1]/ mcN*100).toFixed(0) + '%' : ''})</option>
                        {teamPositions.map(([p, c]) => <option key={p} value={p}>{p} ({(c/ mcN*100).toFixed(0)}%)</option>)}
                      </select>
                      {activePos && posN > 0 && tpcData?.[selTeam]?.[activePos] && (
                        <span style={{ fontSize: '10px', color: gd, fontWeight: 600 }}>🏆 {((tpcData[selTeam][activePos].ch / posN) * 100).toFixed(1)}%</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '8px' }}>
                      {/* Group stage */}
                      <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Fase de Grupos ({grpName})</span><span style={{ color: '#22c55e', fontSize: '10px' }}>{activePos ? `${(posN/ mcN*100).toFixed(0)}%` : '100%'}</span>
                        </div>
                        {grpGames.map((g, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
                            <span style={{ color: dm }}>{DOW(g.date)} {g.date} {g.brt} BRT <span style={{ color: bl }}>{g.city}</span></span>
                            <span>{g.label}</span>
                          </div>
                        ))}
                      </div>
                      {/* KO phases - always show match numbers */}
                      {MG.map(([phase, rdKey, matches]) => {
                        const getMatchRaw = (mn) => {
                          if (activePos && posN > 0 && tpcData?.[selTeam]?.[activePos]?.mn) {
                            return (tpcData[selTeam][activePos].mn[mn] || 0) / mcN * 100;
                          }
                          return matchWhoData ? (matchWhoData[mn]?.[selTeam] || 0) / mcN * 100 : 0;
                        };
                        const posPct = activePos ? (posN / mcN) * 100 : 100;
                        const items = matches.map(([mn, date, city]) => {
                          const raw = getMatchRaw(mn);
                          return { mn, date, city, brt: KO_BRT[mn], raw };
                        }).filter(g => g.raw > 0.05).sort((a,b) => b.raw - a.raw);
                        if (!items.length) return null;
                        const phaseTotalRaw = items.reduce((s,g) => s + g.raw, 0);
                        // Compute avg opponent Elo for this phase
                        let phaseAvgElo = 0;
                        if (activePos && posN > 0 && tpcData?.[selTeam]?.[activePos]?.[rdKey]) {
                          const d = tpcData[selTeam][activePos][rdKey];
                          const tc = Object.values(d).reduce((s,c)=>s+c,0);
                          if (tc > 0) phaseAvgElo = Object.entries(d).reduce((s,[t,c])=>s+rt(t)*c,0) / tc;
                        } else if (tmPct?.[selTeam]?.[rdKey]) {
                          const oppList = tmPct[selTeam][rdKey];
                          const tc = oppList.reduce((s,x)=>s+x.pct,0);
                          if (tc > 0) phaseAvgElo = oppList.reduce((s,x)=>s+rt(x.o)*x.pct,0) / tc;
                        }
                        return (
                          <div key={phase} style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{phase}{phaseAvgElo > 0 && <span style={{ fontSize: '8px', color: dm, fontWeight: 400, marginLeft: '4px' }}>~{Math.round(phaseAvgElo)}</span>}</span>
                              <span style={{ color: phaseTotalRaw > 50 ? '#22c55e' : phaseTotalRaw > 20 ? '#c9a84c' : '#ef4444', fontSize: '10px' }}>Chega: {phaseTotalRaw.toFixed(1)}%</span>
                            </div>
                            {items.map((g, i) => {
                              const display = condMode && phaseTotalRaw > 0 ? (g.raw / phaseTotalRaw * 100) : g.raw;
                              return (
                              <div key={g.mn} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
                                <span style={{ color: dm }}><span style={{ fontSize: '8px', marginRight: '3px' }}>{i+1}.</span>M{g.mn} {DOW(g.date)} {g.date} {g.brt} BRT <span style={{ color: bl }}>{g.city}</span></span>
                                <span style={{ fontWeight: 600, color: acc }}>{display.toFixed(1)}%</span>
                              </div>
                              );
                            })}
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  </div>
                );
              })()}
              <div style={{ fontSize: '9px', color: dm, marginTop: '6px' }}>{condMode ? 'Condicional: % dado que o time chega à fase' : 'Absoluto: % de todas as simulações'}</div>
            </>)}

            {muView === 'pos' && posMu && (<>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>Cruzamentos por posição no grupo</div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', color: dm }}>Posição:</span>
                <select value={selPos} onChange={e => setSelPos(e.target.value)} style={{ padding: '4px 6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                  <option value="">Todos (top geral)</option>
                  {'ABCDEFGHIJKL'.split('').map(g => [1,2,3,4].map(p => {
                    const pk = g + p;
                    const best = posWho?.[pk] ? Object.entries(posWho[pk]).sort((a,b)=>b[1]-a[1])[0] : null;
                    const hint = best ? ` — ${nm(best[0])} ${(best[1]/ mcN*100).toFixed(0)}%` : '';
                    return <option key={pk} value={pk}>{pk}{hint}</option>;
                  })).flat()}
                </select>
                {selPos && <>
                  <SB active={posMode === 'pos'} onClick={() => setPosMode('pos')}>vs Posição</SB>
                  <SB active={posMode === 'team'} onClick={() => setPosMode('team')}>vs Seleção</SB>
                  <span style={{ color: dm, fontSize: '9px' }}>|</span>
                  <SB active={!condMode} onClick={() => setCondMode(false)}>Absoluto</SB>
                  <SB active={condMode} onClick={() => setCondMode(true)}>Condicional</SB>
                </>}
              </div>
              {selPos === '' ? (
                <div style={{ display: 'grid', gap: '3px', maxWidth: '550px' }}>
                  {Object.entries(posMu[muRound] || {})
                    .map(([k, c]) => {
                      const [p1, p2] = k.split('×');
                      const t1 = posWho?.[p1] ? Object.entries(posWho[p1]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                      const t2 = posWho?.[p2] ? Object.entries(posWho[p2]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                      return { k, pct: (c / mcN) * 100, t1, t2 };
                    })
                    .sort((a, b) => b.pct - a.pct)
                    .slice(0, 30)
                    .map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? card : '#0d111d', borderRadius: '4px', fontSize: '11px', alignItems: 'center' }}>
                        <div>
                          <span><span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span><span style={{ fontWeight: 600, fontFamily: 'monospace', color: i < 3 ? bl : tx }}>{m.k}</span></span>
                          {m.t1 && m.t2 && <span style={{ color: dm, fontSize: '9px', marginLeft: '6px' }}>{fl(m.t1)}{nm(m.t1)} vs {fl(m.t2)}{nm(m.t2)}</span>}
                        </div>
                        <span style={{ fontWeight: 700, color: i < 3 ? bl : acc }}>{m.pct.toFixed(1)}%{dTag(m.pct, baseAgg?.posMu?.[muRound] ? (baseAgg.posMu[muRound][m.k] || 0) / baseN * 100 : null)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div>
                  {(() => {
                    const best3 = posWho?.[selPos] ? Object.entries(posWho[selPos]).sort((a,b)=>b[1]-a[1]).slice(0,3) : [];
                    return (
                      <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                        <span style={{ fontFamily: 'monospace', color: bl }}>{selPos}</span>
                        <span style={{ color: dm, fontSize: '11px', marginLeft: '6px' }}>
                          Mais provável: {best3.map(([t,c]) => `${fl(t)}${nm(t)} ${(c/ mcN*100).toFixed(0)}%`).join(', ')}
                          {tpcData && (() => {
                            let chTotal = 0;
                            best3.forEach(([t]) => { if (tpcData[t]?.[selPos]) chTotal += tpcData[t][selPos].ch; });
                            return chTotal > 0 ? <span style={{ color: gd, marginLeft: '6px' }}>🏆 {(chTotal/ mcN*100).toFixed(1)}%</span> : null;
                          })()}
                        </span>
                      </div>
                    );
                  })()}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '8px' }}>
                    {['r32', 'r16', 'qf', 'sf', 'fin'].map(rd => {
                      const labels = { r32: 'R32', r16: 'R16', qf: 'Quartas', sf: 'Semifinais', fin: 'Final' };
                      let items = [];
                      let total = 0;
                      const baseD = posMode === 'pos' ? baseAgg?.posTm?.[rd]?.[selPos] : baseAgg?.posVsTm?.[rd]?.[selPos];
                      const baseAt = k => baseD ? (baseD[k] || 0) / baseN * 100 : null;
                      if (posMode === 'pos') {
                        const d = posTm?.[rd]?.[selPos] || {};
                        items = Object.entries(d).map(([opp, c]) => {
                          const oppBest = posWho?.[opp] ? Object.entries(posWho[opp]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                          return { label: opp, key: opp, hint: oppBest ? `${fl(oppBest)}${nm(oppBest)}` : '', pct: (c / mcN) * 100 };
                        }).sort((a, b) => b.pct - a.pct);
                      } else {
                        const d = posVsTmData?.[rd]?.[selPos] || {};
                        items = Object.entries(d).map(([t, c]) => ({ label: `${fl(t)} ${nm(t)}`, key: t, hint: '', pct: (c / mcN) * 100 })).sort((a, b) => b.pct - a.pct);
                      }
                      total = items.reduce((s, x) => s + x.pct, 0);
                      // Compute avg opponent Elo
                      let posAvgElo = 0;
                      const pvd = posVsTmData?.[rd]?.[selPos] || {};
                      const pvTotal = Object.values(pvd).reduce((s,c)=>s+c,0);
                      if (pvTotal > 0) posAvgElo = Object.entries(pvd).reduce((s,[t,c])=>s+rt(t)*c,0) / pvTotal;
                      if (!items.length) return null;
                      return (
                        <div key={rd} style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{labels[rd]}{posAvgElo > 0 && <span style={{ fontSize: '8px', color: dm, fontWeight: 400, marginLeft: '4px' }}>~{Math.round(posAvgElo)}</span>}</span>
                            <span style={{ color: total > 50 ? '#22c55e' : total > 20 ? '#c9a84c' : '#ef4444', fontSize: '10px' }}>Chega: {total.toFixed(1)}%</span>
                          </div>
                          {items.slice(0, 20).map((x, i) => {
                            const display = condMode && total > 0 ? (x.pct / total * 100) : x.pct;
                            return (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
                                <span>
                                  <span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span>
                                  {posMode === 'pos' && <span style={{ fontFamily: 'monospace', color: bl, marginRight: '4px' }}>{x.label}</span>}
                                  {posMode === 'pos' && x.hint && <span style={{ color: dm, fontSize: '9px' }}>{x.hint}</span>}
                                  {posMode === 'team' && <span>{x.label}</span>}
                                </span>
                                <span style={{ color: acc, fontWeight: 600 }}>{display.toFixed(1)}%{!condMode && dTag(x.pct, baseAt(x.key))}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>
              )}
              <div style={{ fontSize: '9px', color: dm, marginTop: '8px' }}>{condMode ? 'Condicional: % dado que a posição chega à fase' : 'Absoluto: % de todas as simulações'}</div>
            </>)}

            {muView === 'combos' && comboList && (<>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>8 grupos cujos 3°s avançam</div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '9px', color: dm, marginRight: '4px' }}>Filtrar 3°s:</span>
                {[...'ABCDEFGHIJKL'].map(g => {
                  const st = g3filter[g];
                  return <button key={g} onClick={() => setG3filter(p => { const n={...p}; if(!n[g])n[g]='in'; else if(n[g]==='in')n[g]='out'; else delete n[g]; return n; })} style={{ padding:'1px 4px',fontSize:'9px',fontWeight:600,borderRadius:'3px',cursor:'pointer',border:`1px solid ${st==='in'?'#22c55e':st==='out'?'#ef4444':bd}33`,background:st==='in'?'#22c55e22':st==='out'?'#ef444422':'transparent',color:st==='in'?'#22c55e':st==='out'?'#ef4444':dm }}>{g}{st==='in'?'✓':st==='out'?'✗':''}</button>;
                })}
                {Object.keys(g3filter).length > 0 && <button onClick={() => setG3filter({})} style={{ padding:'1px 4px',fontSize:'8px',color:'#ef4444',background:'transparent',border:'none',cursor:'pointer' }}>✕</button>}
              </div>
              {(() => {
                const g3ins = Object.entries(g3filter).filter(([,v])=>v==='in').map(([g])=>g);
                const g3outs = Object.entries(g3filter).filter(([,v])=>v==='out').map(([g])=>g);
                const filtered = comboList.filter(c => {
                  for (const g of g3ins) if (!c.key.includes(g)) return false;
                  for (const g of g3outs) if (c.key.includes(g)) return false;
                  return true;
                });
                const totalPct = filtered.reduce((s,c) => s + c.pct, 0);
                const hasFilter = g3ins.length + g3outs.length > 0;
                return <>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${hasFilter ? bl : bd}44`, padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: hasFilter ? bl : tx }}>{totalPct.toFixed(1)}%</span>
                      {dTag(totalPct, baseAgg?.comboList ? filtered.reduce((s, c) => s + (baseComboPct(c.key) || 0), 0) : null)}
                      <span style={{ fontSize: '9px', color: dm, marginLeft: '6px' }}>das simulações</span>
                    </div>
                    <div style={{ fontSize: '10px', color: dm }}>
                      {hasFilter ? <>soma de <strong style={{ color: tx }}>{filtered.length}</strong> combinações que obedecem ao filtro {g3ins.length > 0 && <span>(avança: <span style={{ color: '#22c55e' }}>{g3ins.join('')}</span>)</span>} {g3outs.length > 0 && <span>(elim: <span style={{ color: '#ef4444' }}>{g3outs.join('')}</span>)</span>}</> : <>soma de todas as {filtered.length} combinações possíveis</>}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '3px', maxWidth: '500px' }}>
                    {filtered.slice(0, 20).map((c, i) => {
                      const elim = 'ABCDEFGHIJKL'.split('').filter(g => !c.key.includes(g));
                      const normPct = totalPct > 0 ? (c.pct / totalPct * 100) : c.pct;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? card : '#0d111d', borderRadius: '4px', fontSize: '11px' }}>
                          <div><span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span><span style={{ color: gn, fontWeight: 600, letterSpacing: '1px' }}>{c.key}</span> <span style={{ color: dm, fontSize: '9px' }}>(elim: <span style={{ color: rd }}>{elim.join('')}</span>)</span></div>
                          <span style={{ fontWeight: 700, color: i < 3 ? bl : acc }}>{condMode && totalPct > 0 ? normPct.toFixed(1) : c.pct.toFixed(1)}%{!condMode && dTag(c.pct, baseComboPct(c.key))}</span>
                        </div>
                      );
                    })}
                  </div>
                  {filtered.length > 20 && <div style={{ fontSize: '9px', color: dm, marginTop: '6px' }}>Mostrando as 20 mais prováveis de {filtered.length} — mas a soma de {totalPct.toFixed(1)}% acima considera <strong>todas</strong>.</div>}
                </>;
              })()}
            </>)}

            {muView === 'venue' && matchTmData && (() => {
              const MATCHES = [
                [73,'28/Jun','Los Angeles','2A×2B','R32'],[74,'29/Jun','Boston','1E×3°','R32'],[75,'29/Jun','Monterrey','1F×2C','R32'],[76,'29/Jun','Houston','1C×2F','R32'],
                [77,'30/Jun','Nova York/NJ','1I×3°','R32'],[78,'30/Jun','Dallas','2E×2I','R32'],[79,'30/Jun','Cd. México','1A×3°','R32'],[80,'1/Jul','Atlanta','1L×3°','R32'],
                [81,'1/Jul','S. Francisco','1D×3°','R32'],[82,'1/Jul','Seattle','1G×3°','R32'],[83,'2/Jul','Toronto','2K×2L','R32'],[84,'2/Jul','Los Angeles','1H×2J','R32'],
                [85,'2/Jul','Vancouver','1B×3°','R32'],[86,'3/Jul','Miami','1J×2H','R32'],[87,'3/Jul','Kansas City','1K×3°','R32'],[88,'3/Jul','Dallas','2D×2G','R32'],
                [89,'4/Jul','Filadélfia','W74×W77','R16'],[90,'4/Jul','Houston','W73×W75','R16'],[91,'5/Jul','Nova York/NJ','W76×W78','R16'],[92,'5/Jul','Cd. México','W79×W80','R16'],
                [93,'6/Jul','Dallas','W83×W84','R16'],[94,'6/Jul','Seattle','W81×W82','R16'],[95,'7/Jul','Atlanta','W86×W88','R16'],[96,'7/Jul','Vancouver','W85×W87','R16'],
                [97,'9/Jul','Boston','W89×W90','QF'],[98,'10/Jul','Los Angeles','W93×W94','QF'],[99,'11/Jul','Miami','W91×W92','QF'],[100,'11/Jul','Kansas City','W95×W96','QF'],
                [101,'14/Jul','Dallas','W97×W98','SF'],[102,'15/Jul','Atlanta','W99×W100','SF'],
                [103,'18/Jul','Miami','3° lugar','3°'],[104,'19/Jul','MetLife','FINAL','FIN']
              ];
              const sel = MATCHES.find(m => m[0] === selMatch) || MATCHES[0];
              const [mn, date, city, struct, phase] = sel;
              // Filter match data by g3filter
              const g3ins = Object.entries(g3filter).filter(([,v])=>v==='in').map(([g])=>g);
              const g3outs = Object.entries(g3filter).filter(([,v])=>v==='out').map(([g])=>g);
              const hasG3F = g3ins.length + g3outs.length > 0;
              let filteredPairs = {};
              let filteredN = nSim;
              if (hasG3F && matchByG3Data?.[mn]) {
                filteredN = 0;
                Object.entries(matchByG3Data[mn]).forEach(([g3k, prs]) => {
                  let ok = true;
                  for (const g of g3ins) if (!g3k.includes(g)) { ok = false; break; }
                  if (ok) for (const g of g3outs) if (g3k.includes(g)) { ok = false; break; }
                  if (!ok) return;
                  Object.entries(prs).forEach(([pk, c]) => { filteredPairs[pk] = (filteredPairs[pk]||0) + c; filteredN += c; });
                });
                filteredN = filteredN; // each sim contributes exactly 1 pair per match
              }
              const useFiltered = hasG3F && Object.keys(filteredPairs).length > 0;
              const dn = useFiltered ? filteredN : nSim;
              const pairs = (useFiltered ? Object.entries(filteredPairs) : (matchTmData[mn] ? Object.entries(matchTmData[mn]) : [])).map(([k, c]) => { const [a, b] = k.split('|'); return { a, b, key: k, pct: (c / dn) * 100 }; }).sort((x, y) => y.pct - x.pct);
              // Baseline pré-Copa do mesmo par/seleção neste jogo (só faz sentido sem filtro de 3ºs).
              const baseMatch = (!useFiltered && baseAgg?.matchTm?.[mn]) ? baseAgg.matchTm[mn] : null;
              const basePairAt = (key) => baseMatch ? (baseMatch[key] || 0) / baseN * 100 : null;
              const baseTeamAt = (t) => baseMatch ? Object.entries(baseMatch).reduce((s, [k, c]) => { const [a, b] = k.split('|'); return s + (a === t || b === t ? c : 0); }, 0) / baseN * 100 : null;
              // Derive teams from pairs
              const teamMap = {};
              pairs.forEach(p => { teamMap[p.a] = (teamMap[p.a]||0) + p.pct; teamMap[p.b] = (teamMap[p.b]||0) + p.pct; });
              const teams = Object.entries(teamMap).map(([t, pct]) => ({ t, pct })).sort((a, b) => b.pct - a.pct);
              const positions = matchPosData?.[mn] ? Object.entries(matchPosData[mn]).map(([k, c]) => ({ k, pct: (c / mcN) * 100 })).sort((a, b) => b.pct - a.pct) : [];

              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>Quem joga cada jogo do mata-mata?</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <select value={selMatch} onChange={e => setSelMatch(+e.target.value)} style={{ padding: '5px 8px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '11px', maxWidth: '320px' }}>
                    {MATCHES.map(([mn, date, city, struct, phase]) => (
                      <option key={mn} value={mn}>M{mn} {phase} {DOW(date)} {date} {city} ({struct})</option>
                    ))}
                  </select>
                  <SB active={venueMode === 'pair'} onClick={() => setVenueMode('pair')}>Cruzamentos</SB>
                  <SB active={venueMode === 'team'} onClick={() => setVenueMode('team')}>Por Seleção</SB>
                  <SB active={venueMode === 'pos'} onClick={() => setVenueMode('pos')}>Por Posição</SB>
                </div>
                {/* g3 filter for 3rd-place annotation */}
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: dm, marginRight: '4px' }}>3°s:</span>
                  {[...'ABCDEFGHIJKL'].map(g => {
                    const st = g3filter[g];
                    return <button key={g} onClick={() => setG3filter(p => { const n={...p}; if(!n[g])n[g]='in'; else if(n[g]==='in')n[g]='out'; else delete n[g]; return n; })} style={{ padding:'1px 4px',fontSize:'9px',fontWeight:600,borderRadius:'3px',cursor:'pointer',border:`1px solid ${st==='in'?'#22c55e':st==='out'?'#ef4444':bd}33`,background:st==='in'?'#22c55e22':st==='out'?'#ef444422':'transparent',color:st==='in'?'#22c55e':st==='out'?'#ef4444':dm }}>{g}{st==='in'?'✓':st==='out'?'✗':''}</button>;
                  })}
                  {Object.keys(g3filter).length > 0 && <button onClick={() => setG3filter({})} style={{ padding:'1px 4px',fontSize:'8px',color:'#ef4444',background:'transparent',border:'none',cursor:'pointer' }}>✕</button>}
                </div>

                <div style={{ background: card, borderRadius: '7px', border: `1px solid ${bd}`, padding: '10px 12px', maxWidth: '600px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>M{mn} <span style={{ color: bl }}>{phase}</span></span>
                    <span style={{ fontSize: '11px', color: dm }}>{DOW(date)} {date} • <span style={{ color: acc, fontWeight: 600 }}>{KO_BRT[mn] || ''} BRT</span> • {city}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '4px' }}>Estrutura: {struct}{useFiltered ? <span style={{ color: bl, marginLeft: '6px' }}>({filteredN} sims filtradas de {nSim})</span> : ''}{teams.length > 0 && (() => { const tc=teams.reduce((s,x)=>s+x.pct,0); return tc > 0 ? <span style={{ marginLeft: '6px' }}>Elo médio: <span style={{ color: bl }}>{Math.round(teams.reduce((s,x)=>s+rt(x.t)*x.pct,0)/tc)}</span></span> : null; })()}</div>
                  {/* Annex C annotation for R32 3rd-place matches */}
                  {struct.includes('3°') && Object.keys(g3filter).length > 0 && (() => {
                    const W8 = ['A','B','D','E','G','I','K','L'];
                    const slotMap = {79:0,85:1,81:2,74:3,82:4,77:5,87:6,80:7}; // mn → AC slot index
                    const slot = slotMap[mn];
                    if (slot == null) return null;
                    const acEntries = AC_RAW.split('|').map(e => { const [k,v]=e.split(':'); return {groups:k,assign:v}; });
                    const ins = Object.entries(g3filter).filter(([,v])=>v==='in').map(([g])=>g);
                    const outs = Object.entries(g3filter).filter(([,v])=>v==='out').map(([g])=>g);
                    const filtered = acEntries.filter(({groups:gs}) => {
                      for(const g of ins) if(!gs.includes(g)) return false;
                      for(const g of outs) if(gs.includes(g)) return false;
                      return true;
                    });
                    const freq = {};
                    filtered.forEach(({assign}) => { const g3=assign[slot]; freq[g3]=(freq[g3]||0)+1; });
                    const n = filtered.length;
                    if (n === 0) return null;
                    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]);
                    return <div style={{ fontSize: '9px', color: bl, marginBottom: '4px' }}>Anexo C ({n} comb.): {sorted.map(([g,c])=>`3°${g} ${(c/n*100).toFixed(0)}%`).join(', ')}</div>;
                  })()}

                  {venueMode === 'pair' && (
                    <div style={{ display: 'grid', gap: '2px' }}>
                      {pairs.slice(0, 100).map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? 'transparent' : '#0d111d', borderRadius: '3px', fontSize: '11px' }}>
                          <span>{fl(p.a)} {nm(p.a)} <span style={{ color: dm }}>vs</span> {fl(p.b)} {nm(p.b)}</span>
                          <span style={{ color: i < 3 ? bl : acc, fontWeight: 600, minWidth: '42px', textAlign: 'right' }}>{p.pct.toFixed(1)}%{dTag(p.pct, basePairAt(p.key))}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {venueMode === 'team' && (
                    <div style={{ display: 'grid', gap: '2px' }}>
                      {teams.slice(0, 100).map((x, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? 'transparent' : '#0d111d', borderRadius: '3px', fontSize: '11px' }}>
                          <span>{fl(x.t)} {nm(x.t)}</span>
                          <span style={{ color: i < 3 ? bl : acc, fontWeight: 600, minWidth: '42px', textAlign: 'right' }}>{x.pct.toFixed(1)}%{dTag(x.pct, baseTeamAt(x.t))}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {venueMode === 'pos' && (
                    <div style={{ display: 'grid', gap: '2px' }}>
                      {positions.length === 0 && <div style={{ color: dm, fontSize: '11px' }}>Sem dados de posição para este jogo</div>}
                      {positions.slice(0, 100).map((x, i) => {
                        const [p1, p2] = x.k.split('×');
                        const t1 = posWho?.[p1] ? Object.entries(posWho[p1]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                        const t2 = posWho?.[p2] ? Object.entries(posWho[p2]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? 'transparent' : '#0d111d', borderRadius: '3px', fontSize: '11px', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span><span style={{ fontFamily: 'monospace', fontWeight: 600, color: i < 3 ? bl : tx }}>{x.k}</span>
                              {t1 && t2 && <span style={{ color: dm, fontSize: '9px', marginLeft: '6px' }}>{fl(t1)}{nm(t1)} vs {fl(t2)}{nm(t2)}</span>}
                            </div>
                            <span style={{ color: i < 3 ? bl : acc, fontWeight: 600, minWidth: '42px', textAlign: 'right' }}>{x.pct.toFixed(1)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>);
            })()}

            {muView === 'elo' && (() => {
              // Group stage games
              // Compute title shift for GS games
              const computeGsShift = (idx) => {
                const d = gsShiftData?.[idx];
                if (!d) return 0;
                const outcomes = ['H','D','A'];
                const ns = { H: d.nH, D: d.nD, A: d.nA };
                // Collect all champion teams across outcomes
                const allTeams = new Set();
                outcomes.forEach(o => Object.keys(d[o]).forEach(t => allTeams.add(t)));
                const totalN = ns.H + ns.D + ns.A;
                let maxWeighted = 0;
                allTeams.forEach(t => {
                  // For each pair of outcomes, compute weighted swing
                  for (let oi = 0; oi < outcomes.length; oi++) {
                    for (let oj = oi+1; oj < outcomes.length; oj++) {
                      const o1 = outcomes[oi], o2 = outcomes[oj];
                      if (ns[o1] < 10 || ns[o2] < 10) continue;
                      const p1 = (d[o1][t] || 0) / ns[o1] * 100;
                      const p2 = (d[o2][t] || 0) / ns[o2] * 100;
                      const swing = Math.abs(p1 - p2);
                      // Weight by probability of the rarer outcome
                      const weight = Math.min(ns[o1], ns[o2]) / totalN;
                      const weighted = swing * weight;
                      if (weighted > maxWeighted) maxWeighted = weighted;
                    }
                  }
                });
                return maxWeighted;
              };
              // Compute title shift for KO games
              const computeKoShift = (mn) => {
                const d = koShiftData?.[mn];
                if (!d) return 0;
                const winners = Object.keys(d);
                if (winners.length < 2) return 0;
                const allTeams = new Set();
                winners.forEach(w => Object.keys(d[w]).forEach(t => { if (t !== 'total') allTeams.add(t); }));
                const totalN = winners.reduce((s,w) => s + d[w].total, 0);
                let maxWeighted = 0;
                allTeams.forEach(t => {
                  for (let wi = 0; wi < winners.length; wi++) {
                    for (let wj = wi+1; wj < winners.length; wj++) {
                      const w1 = winners[wi], w2 = winners[wj];
                      if (d[w1].total < 10 || d[w2].total < 10) continue;
                      const p1 = (d[w1][t] || 0) / d[w1].total * 100;
                      const p2 = (d[w2][t] || 0) / d[w2].total * 100;
                      const swing = Math.abs(p1 - p2);
                      const weight = Math.min(d[w1].total, d[w2].total) / totalN;
                      const weighted = swing * weight;
                      if (weighted > maxWeighted) maxWeighted = weighted;
                    }
                  }
                });
                return maxWeighted;
              };

              const gsGames = GS.map(([gn, hi, ai, date, city], idx) => {
                const h = groups[gn][hi], a = groups[gn][ai];
                const avg = Math.round((rt(h) + rt(a)) / 2);
                return { mn: idx + 1, date, city, brt: GS_BRT[idx], phase: 'Grupos', avgElo: avg, top: `${fl(h)}${nm(h)} vs ${fl(a)}${nm(a)}`, champ: matchChampData?.[idx+1] ? (matchChampData[idx+1] / mcN * 100) : 0, struct: `G${gn}`, shift: computeGsShift(idx) };
              });
              // KO games
              const KO_MATCHES = [
                ['R32',73,'28/Jun','Los Angeles','2A×2B'],['R32',74,'29/Jun','Boston','1E×3°'],['R32',75,'29/Jun','Monterrey','1F×2C'],['R32',76,'29/Jun','Houston','1C×2F'],
                ['R32',77,'30/Jun','Nova York/NJ','1I×3°'],['R32',78,'30/Jun','Dallas','2E×2I'],['R32',79,'30/Jun','Cd. México','1A×3°'],['R32',80,'1/Jul','Atlanta','1L×3°'],
                ['R32',81,'1/Jul','Filadélfia','1D×3°'],['R32',82,'1/Jul','Seattle','1G×3°'],['R32',83,'2/Jul','Los Angeles','2K×2L'],['R32',84,'2/Jul','Guadalajara','1H×2J'],
                ['R32',85,'2/Jul','Miami','1B×3°'],['R32',86,'3/Jul','S. Francisco','1J×2H'],['R32',87,'3/Jul','Dallas','1K×3°'],['R32',88,'3/Jul','Kansas City','2D×2G'],
                ['R16',89,'4/Jul','Filadélfia','W74×W77'],['R16',90,'4/Jul','Houston','W73×W75'],['R16',91,'5/Jul','Nova York/NJ','W76×W78'],['R16',92,'5/Jul','Cd. México','W79×W80'],
                ['R16',93,'6/Jul','Dallas','W83×W84'],['R16',94,'6/Jul','Seattle','W81×W82'],['R16',95,'7/Jul','Atlanta','W86×W88'],['R16',96,'7/Jul','Vancouver','W85×W87'],
                ['QF',97,'9/Jul','Boston','W89×W90'],['QF',98,'10/Jul','Los Angeles','W93×W94'],['QF',99,'10/Jul','Miami','W91×W92'],['QF',100,'11/Jul','Kansas City','W95×W96'],
                ['SF',101,'14/Jul','Dallas','W97×W98'],['SF',102,'15/Jul','Atlanta','W99×W100'],
                ['3°/4°',103,'18/Jul','Miami','L101×L102'],['Final',104,'19/Jul','MetLife','W101×W102']
              ];
              const koGames = KO_MATCHES.map(([phase, mn, date, city, struct]) => {
                const pairData = matchTmData?.[mn];
                let avgElo = 0, topPair = '';
                if (pairData) {
                  let wSum = 0, wCnt = 0, bestC = 0, bestK = '';
                  Object.entries(pairData).forEach(([k, c]) => {
                    const [a, b] = k.split('|');
                    wSum += ((rt(a) + rt(b)) / 2) * c; wCnt += c;
                    if (c > bestC) { bestC = c; bestK = k; }
                  });
                  if (wCnt > 0) avgElo = Math.round(wSum / wCnt);
                  if (bestK) {
                    const [a, b] = bestK.split('|');
                    // Find most likely positions for this pair
                    const pData = matchPosData?.[mn];
                    let bestPosK = '';
                    if (pData) { let bp = 0; Object.entries(pData).forEach(([pk, pc]) => { if (pc > bp) { bp = pc; bestPosK = pk; } }); }
                    topPair = bestPosK ? `${bestPosK.replace('×','x')} ${fl(a)}${nm(a)} vs ${fl(b)}${nm(b)}` : `${fl(a)}${nm(a)} vs ${fl(b)}${nm(b)}`;
                  }
                }
                const champ = matchChampData?.[mn] ? (matchChampData[mn] / mcN * 100) : 0;
                return { mn, date, city, brt: KO_BRT[mn], phase, avgElo, top: topPair, champ, struct, shift: computeKoShift(mn) };
              }).filter(m => m.avgElo > 0);

              // Add closeness metric - dynamic scale based on max disparity in tournament
              const allDiffs = [];
              gsGames.forEach(g => {
                const [gn] = GS[g.mn - 1];
                const h = groups[gn][GS[g.mn-1][1]], a = groups[gn][GS[g.mn-1][2]];
                const diff = Math.abs(rt(h) - rt(a));
                g._diff = diff;
                allDiffs.push(diff);
              });
              koGames.forEach(g => {
                if (!matchTmData?.[g.mn]) { g._diff = 200; allDiffs.push(200); return; }
                let wDiff = 0, wCnt = 0;
                Object.entries(matchTmData[g.mn]).forEach(([k, c]) => {
                  const [a, b] = k.split('|');
                  wDiff += Math.abs(rt(a) - rt(b)) * c; wCnt += c;
                });
                g._diff = wCnt > 0 ? wDiff / wCnt : 200;
                allDiffs.push(g._diff);
              });
              const maxDiff = Math.max(...allDiffs, 1);
              gsGames.forEach(g => { g.closeness = Math.round(Math.max(0, (1 - g._diff / maxDiff) * 100)); });
              koGames.forEach(g => { g.closeness = Math.round(Math.max(0, (1 - g._diff / maxDiff) * 100)); });

              const allGames = [...gsGames, ...koGames];

              // Normalize shift to 0-100 index (final = 100)
              const maxRawShift = Math.max(...allGames.map(m => m.shift), 0.01);
              allGames.forEach(m => { m.shiftIdx = Math.round(m.shift / maxRawShift * 100); });

              // Compute interest score: average of percentile ranks
              const rankBy = (arr, key) => {
                const s = [...arr].sort((a, b) => b[key] - a[key]);
                s.forEach((m, i) => { m['_r_' + key] = (arr.length - i) / arr.length * 100; });
              };
              rankBy(allGames, 'avgElo');
              rankBy(allGames, 'shiftIdx');
              rankBy(allGames, 'closeness');
              rankBy(allGames, 'champ');
              allGames.forEach(m => { m.interest = Math.round((m._r_avgElo + m._r_shiftIdx + m._r_closeness + m._r_champ) / 4); });
              // Mark top 10 interest among group stage games only
              const gsByInterest = [...allGames].filter(m => m.phase === 'Grupos').sort((a, b) => b.interest - a.interest);
              gsByInterest.forEach((m, i) => { m.top10 = i < 10; m.interestRank = i + 1; });

              const phases = ['Grupos', 'R32', 'R16', 'QF', 'SF', '3°/4°', 'Final'];
              const sortByChamp = eloPhase.endsWith('_ch');
              const sortByShift = eloPhase.endsWith('_sh');
              const sortByClose = eloPhase.endsWith('_cl');
              const sortByInt = eloPhase.endsWith('_in');
              const cleanPhase = eloPhase.replace(/_(?:ch|sh|cl|in)$/, '');
              const actualFiltered = allGames.filter(m => cleanPhase === 'all' ? true : m.phase === cleanPhase);
              const getSuffix = () => sortByChamp ? '_ch' : sortByShift ? '_sh' : sortByClose ? '_cl' : sortByInt ? '_in' : '';
              const sorted = [...actualFiltered].sort((a, b) =>
                sortByInt ? b.interest - a.interest :
                sortByShift ? b.shiftIdx - a.shiftIdx :
                sortByChamp ? b.champ - a.champ :
                sortByClose ? b.closeness - a.closeness :
                b.avgElo - a.avgElo);

              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>Qualidade e importância dos jogos</div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {['all', ...phases].map(ph => <SB key={ph} active={cleanPhase === ph} onClick={() => setEloPhase(ph + getSuffix())}>{ph === 'all' ? 'Todos' : ph}</SB>)}
                </div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', color: dm, marginRight: '4px' }}>Ordenar:</span>
                  <Tip text="Média ponderada dos Elos dos dois times por probabilidade de cada cruzamento"><SB active={!sortByChamp && !sortByShift && !sortByClose && !sortByInt} onClick={() => setEloPhase(cleanPhase)}>Elo</SB></Tip>
                  <Tip text="Em quantas simulações o eventual campeão joga nesse jogo"><SB active={sortByChamp} onClick={() => setEloPhase(cleanPhase + '_ch')}>🏆 Champ</SB></Tip>
                  <Tip text="Quanto o resultado muda a chance de título (0-100, Final=100), ponderado pela probabilidade do resultado"><SB active={sortByShift} onClick={() => setEloPhase(cleanPhase + '_sh')}>⚡ Shift</SB></Tip>
                  <Tip text="Quão equilibrado é o confronto. 100 = times iguais, 0 = maior disparidade do torneio"><SB active={sortByClose} onClick={() => setEloPhase(cleanPhase + '_cl')}>⚖️ Equilíbrio</SB></Tip>
                  <Tip text="Score composto: média dos percentis de Elo, Title Shift e Equilíbrio. Top 10 jogos de grupo destacados com 🔥."><SB active={sortByInt} onClick={() => setEloPhase(cleanPhase + '_in')}>🔥 Interesse</SB></Tip>
                </div>
                <div style={{ display: 'grid', gap: '2px', maxWidth: '720px' }}>
                  {sorted.slice(0, 80).map((m, i) => (
                    <div key={`${m.phase}-${m.mn}`} style={{ display: 'grid', gridTemplateColumns: '44px 36px 1fr 34px 34px 28px 28px 30px', padding: '3px 5px', background: m.top10 ? `${gd}10` : i % 2 === 0 ? card : '#0d111d', borderRadius: '3px', fontSize: '10px', alignItems: 'center', gap: '2px', borderLeft: m.top10 ? `2px solid ${gd}` : '2px solid transparent' }}>
                      <span style={{ fontWeight: 600, color: m.top10 ? gd : tx, fontSize: '10px' }}>{m.top10 ? '🔥' : ''}M{m.mn}</span>
                      <span style={{ fontSize: '8px', color: acc }}>{m.phase}</span>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '9px', color: dm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{DOW(m.date)} {m.date} {m.brt} • {m.city}</div>
                        {m.top && <div style={{ fontSize: '8px', color: bl, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.top}</div>}
                      </div>
                      <Tip text="Elo médio"><span style={{ fontWeight: 700, textAlign: 'right', color: m.avgElo > 1950 ? gd : m.avgElo > 1850 ? bl : dm, fontSize: '10px' }}>{m.avgElo}</span></Tip>
                      <Tip text="Champion stake"><span style={{ textAlign: 'right', fontSize: '8px', color: m.champ > 20 ? gd : m.champ > 10 ? bl : dm }}>🏆{m.champ.toFixed(0)}%</span></Tip>
                      <Tip text="Title shift (0-100)"><span style={{ textAlign: 'right', fontSize: '8px', color: m.shiftIdx > 30 ? '#f97316' : m.shiftIdx > 10 ? bl : dm }}>⚡{m.shiftIdx}</span></Tip>
                      <Tip text="Equilíbrio"><span style={{ textAlign: 'right', fontSize: '8px', color: m.closeness > 80 ? '#22c55e' : m.closeness > 50 ? bl : dm }}>⚖{Math.round(m.closeness)}</span></Tip>
                      <Tip text="Score de interesse"><span style={{ textAlign: 'right', fontSize: '9px', fontWeight: 700, color: m.interest > 80 ? gd : m.interest > 60 ? bl : dm }}>🔥{m.interest}</span></Tip>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '9px', color: dm, marginTop: '6px' }}>
                  <strong>Elo:</strong> qualidade média. <strong>🏆 Champ:</strong> % do campeão nesse jogo. <strong>⚡ Shift:</strong> impacto no título (0-100, Final=100). <strong>⚖ Equilíbrio:</strong> proximidade de Elo. <strong>🔥 Interesse:</strong> média dos percentis.
                </div>
              </>);
            })()}

            {muView === 'duel' && (<>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>Duelo — chance de se cruzarem, histórico e análise do confronto</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <select value={confA} onChange={e => setConfA(e.target.value)} style={{ padding: '6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
                  {all.sort((a, b) => rt(b) - rt(a)).map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                </select>
                <span style={{ color: dm, fontSize: '13px' }}>vs</span>
                <select value={confB} onChange={e => setConfB(e.target.value)} style={{ padding: '6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
                  {all.sort((a, b) => rt(b) - rt(a)).map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                </select>
                <button onClick={() => setConfKO(v => !v)} style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: confKO ? `${acc}33` : card, color: confKO ? acc : dm, border: `1px solid ${confKO ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }} title="Alterna a análise do confronto entre jogo normal e mata-mata (prorrogação + pênaltis)">{confKO ? '🥊 Mata-mata' : '⚽ Jogo normal'}</button>
                <span style={{ fontSize: '9px', color: dm }}>ΔElo {rtBase(confA) - rtBase(confB) >= 0 ? '+' : ''}{rtBase(confA) - rtBase(confB)}</span>
              </div>
              {confA === confB ? <div style={{ color: dm, fontSize: '11px' }}>Selecione dois times diferentes.</div> : (() => {
                const k1 = [confA, confB].sort().join('|');
                const grpA = Object.entries(groups).find(([,ts]) => ts.includes(confA))?.[0];
                const grpB = Object.entries(groups).find(([,ts]) => ts.includes(confB))?.[0];
                const sameGroup = grpA === grpB;
                // Group stage: check if they play each other
                const gsMatch = sameGroup ? GS.findIndex(([gn, hi, ai]) => {
                  const ts = groups[gn];
                  return (ts[hi] === confA && ts[ai] === confB) || (ts[hi] === confB && ts[ai] === confA);
                }) : -1;

                const phases = ['r32', 'r16', 'qf', 'sf', 'fin'];
                const labels = { r32: 'R32 (32avos)', r16: 'R16 (Oitavas)', qf: 'Quartas', sf: 'Semifinais', fin: 'Final' };
                const data = phases.map(rd => {
                  const muData = muPct?.[rd];
                  if (!muData) return { rd, pct: 0 };
                  const match = muData.find(m => {
                    const mk = [m.a, m.b].sort().join('|');
                    return mk === k1;
                  });
                  return { rd, pct: match?.pct || 0 };
                });
                const anyPhase = data.reduce((s, d) => s + d.pct, 0);
                const totalKO = anyPhase;

                // Poisson probabilities if they meet
                const eA = efCity(confA, 'MetLife'), eB = efCity(confB, 'MetLife');
                const pr = mProbs(eA, eB, confA, confB);

                return (
                  <div style={{ maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px', background: card, borderRadius: '8px', border: `1px solid ${bd}` }}>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '20px' }}>{fl(confA)}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{nm(confA)}</div>
                        <div style={{ fontSize: '10px', color: dm }}>{rt(confA)} pts • Grupo {grpA}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0 10px' }}>
                        <div style={{ fontSize: '9px', color: dm }}>Se se enfrentarem</div>
                        <div style={{ fontSize: '11px' }}><span style={{ color: gn }} title={`vitória de ${nm(confA)}`}>{pr.pH.toFixed(0)}%</span> <span style={{ color: dm }}>—</span> <span style={{ color: dm }} title="empate">{pr.pD.toFixed(0)}%</span> <span style={{ color: dm }}>—</span> <span style={{ color: bl }} title={`vitória de ${nm(confB)}`}>{pr.pA.toFixed(0)}%</span></div>
                      </div>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '20px' }}>{fl(confB)}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{nm(confB)}</div>
                        <div style={{ fontSize: '10px', color: dm }}>{rt(confB)} pts • Grupo {grpB}</div>
                      </div>
                    </div>

                    {h2hBox(confA, confB)}

                    {sameGroup && <div style={{ background: `${gn}15`, border: `1px solid ${gn}44`, borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: gn }}>Mesmo grupo ({grpA}) — jogam na fase de grupos</div>
                      {gsMatch >= 0 && <div style={{ fontSize: '10px', color: dm, marginTop: '2px' }}>M{gsMatch+1} • {DOW(GS[gsMatch][3])} {GS[gsMatch][3]} {GS_BRT[gsMatch]} BRT • {GS[gsMatch][4]}</div>}
                    </div>}

                    {!sameGroup && <div style={{ background: `${bl}10`, border: `1px solid ${bl}33`, borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: bl }}>Grupos diferentes ({grpA} vs {grpB}) — só podem se enfrentar no mata-mata</div>
                      <div style={{ fontSize: '10px', color: dm, marginTop: '2px' }}>Probabilidade total de confronto: <span style={{ color: acc, fontWeight: 700 }}>{totalKO.toFixed(1)}%</span></div>
                    </div>}

                    <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '6px' }}>Probabilidade por fase <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>(toque para ver cenários de qualificação)</span></div>
                    {data.map(({ rd, pct }) => {
                      const barW = Math.min(100, pct * 3);
                      const dpRd = duelPosData?.[k1]?.[rd];
                      const expandable = pct > 0.01 && dpRd && Object.keys(dpRd).length > 0;
                      const isExp = duelExpand === rd && expandable;
                      const posLabel = p => p && p.length >= 2 ? p.slice(1) + '°' + p[0] : p;
                      let breakdown = null;
                      if (isExp) {
                        const [first] = k1.split('|');
                        breakdown = Object.entries(dpRd).map(([dpk, c]) => {
                          const [pF, pS] = dpk.split('|');
                          const posA = first === confA ? pF : pS;
                          const posB = first === confA ? pS : pF;
                          return { posA, posB, c, pct: c / mcN * 100 };
                        }).sort((a, b) => b.c - a.c);
                      }
                      const maxBd = breakdown && breakdown[0] ? breakdown[0].pct : 0;
                      return (
                        <div key={rd}>
                          <div onClick={() => expandable && setDuelExpand(isExp ? null : rd)}
                               style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: expandable ? 'pointer' : 'default', userSelect: 'none', borderRadius: '3px', background: isExp ? `${acc}11` : 'transparent' }}>
                            <span style={{ fontSize: '10px', color: dm, minWidth: '95px' }}>{labels[rd]} {expandable && <span style={{ color: acc, fontSize: '9px' }}>{isExp ? '▴' : '▾'}</span>}</span>
                            <div style={{ flex: 1, background: `${bd}44`, borderRadius: '3px', height: '14px', overflow: 'hidden' }}>
                              <div style={{ background: pct > 5 ? `linear-gradient(90deg, ${acc}, ${gd})` : pct > 0 ? bl : 'transparent', height: '100%', width: `${barW}%`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                                {pct > 2 && <span style={{ fontSize: '8px', color: '#000', fontWeight: 700 }}>{pct.toFixed(1)}%</span>}
                              </div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: pct > 5 ? gd : pct > 1 ? acc : dm, minWidth: '40px', textAlign: 'right' }}>{pct.toFixed(1)}%{dTag(pct, basePairPct(baseAgg?.muPct?.[rd], confA, confB))}</span>
                          </div>
                          {isExp && breakdown && breakdown.length > 0 && (
                            <div style={{ marginLeft: '12px', padding: '6px 10px 8px', background: `${card}aa`, borderLeft: `2px solid ${acc}`, marginTop: '3px', marginBottom: '6px', borderRadius: '0 4px 4px 0' }}>
                              <div style={{ fontSize: '9px', color: dm, marginBottom: '4px' }}>Cenários de qualificação ({breakdown.length}) que levam a este encontro:</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '12px 60px 1fr 60px 12px', gap: '4px', fontSize: '8px', color: dm, marginBottom: '2px', fontWeight: 600 }}>
                                <span></span><span>{nm(confA)}</span><span></span><span style={{ textAlign: 'right' }}>{nm(confB)}</span><span></span>
                              </div>
                              {breakdown.slice(0, 20).map((b, i) => {
                                const wPct = pct > 0 ? (b.pct / pct) * 100 : 0;
                                const barBd = maxBd > 0 ? (b.pct / maxBd) * 100 : 0;
                                return (
                                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 60px 1fr 60px 60px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '2px 0' }}>
                                    <span>{fl(confA)}</span>
                                    <span style={{ color: tx, fontWeight: 600, fontFamily: 'monospace' }}>{posLabel(b.posA)}</span>
                                    <div style={{ background: `${bd}33`, borderRadius: '2px', height: '8px', overflow: 'hidden' }}>
                                      <div style={{ background: acc, height: '100%', width: `${barBd}%`, opacity: 0.7 }}/>
                                    </div>
                                    <span style={{ color: tx, fontWeight: 600, fontFamily: 'monospace', textAlign: 'right' }}>{posLabel(b.posB)} {fl(confB)}</span>
                                    <span style={{ textAlign: 'right' }}>
                                      <span style={{ color: acc, fontWeight: 600 }}>{b.pct.toFixed(2)}%</span>
                                      <span style={{ color: dm, fontSize: '8px' }}> ({wPct.toFixed(0)}%)</span>
                                    </span>
                                  </div>
                                );
                              })}
                              {breakdown.length > 20 && <div style={{ fontSize: '9px', color: dm, marginTop: '4px', fontStyle: 'italic' }}>+{breakdown.length - 20} cenários menores omitidos</div>}
                              <div style={{ fontSize: '8px', color: dm, marginTop: '6px', borderTop: `1px solid ${bd}33`, paddingTop: '4px' }}>1ª coluna% = sobre todas as simulações • (X%) = sobre os encontros nesta fase</div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {sameGroup && <div style={{ marginTop: '10px', fontSize: '10px', color: dm }}>
                      Como estão no mesmo grupo, não podem se enfrentar no R32. O confronto no mata-mata só é possível a partir das oitavas.
                    </div>}
                  </div>
                );
              })()}
            </>)}

            {muView === 'cutoff' && cutoff3rdData && (() => {
              const data = cutoff3rdData;
              const n = data.length;
              if (!n) return <div style={{ color: dm }}>Rode a simulação.</div>;
              const freq = {};
              data.forEach(d => {
                const gdLabel = d.gd >= 0 ? '+' + d.gd : '' + d.gd;
                const k = d.pts + 'pts ' + gdLabel;
                if (!freq[k]) freq[k] = { pts: d.pts, gd: d.gd, cnt: 0 };
                freq[k].cnt++;
              });
              const rows = Object.values(freq).sort((a, b) => b.pts - a.pts || b.gd - a.gd);
              const maxCnt = Math.max(...rows.map(r => r.cnt));
              // Cumulative from bottom (worst) to top (best)
              let cumul = 0;
              for (let i = rows.length - 1; i >= 0; i--) { cumul += rows[i].cnt; rows[i].cumPct = cumul / n * 100; }
              // Find median: last row (scanning top→bottom) where cumPct >= 50 = first row scanning bottom→top where cumPct >= 50
              const median = [...rows].reverse().find(r => r.cumPct >= 50) || rows[rows.length - 1];
              const medLabel = median ? `${median.pts}pts ${median.gd >= 0 ? '+' : ''}${median.gd}` : '?';
              // Baseline pré-Copa (mesma lógica) para mostrar de onde o corte saiu.
              let medLabelBase = null, dMeanPts = null;
              if (baseAgg?.cutoff3rd?.length) {
                const bdat = baseAgg.cutoff3rd, bn = bdat.length, bfreq = {};
                bdat.forEach(d => { const k = d.pts + 'p' + d.gd; if (!bfreq[k]) bfreq[k] = { pts: d.pts, gd: d.gd, cnt: 0 }; bfreq[k].cnt++; });
                const brows = Object.values(bfreq).sort((a, b) => b.pts - a.pts || b.gd - a.gd);
                let bc = 0; for (let i = brows.length - 1; i >= 0; i--) { bc += brows[i].cnt; brows[i].cumPct = bc / bn * 100; }
                const bmed = [...brows].reverse().find(r => r.cumPct >= 50) || brows[brows.length - 1];
                medLabelBase = bmed ? `${bmed.pts}pts ${bmed.gd >= 0 ? '+' : ''}${bmed.gd}` : null;
                dMeanPts = data.reduce((s, d) => s + d.pts, 0) / n - bdat.reduce((s, d) => s + d.pts, 0) / bn;
              }
              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: bl }}>Corte do 8° melhor terceiro colocado</div>
                <div style={{ fontSize: '10px', color: dm, marginBottom: '10px' }}>Em cada simulação, os 12 terceiros são ranqueados por pontos, saldo e gols. O 8° (último a avançar) define o corte. Abaixo, a frequência de cada combinação.</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${gd}44`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Mediana do corte (50%)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: gd }}>{medLabel}</div>
                  </div>
                  {medLabelBase && (
                    <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px 14px', textAlign: 'center' }} title="Corte mediano na simulação pré-Copa (sem resultados) e variação da média de pontos do corte desde o início.">
                      <div style={{ fontSize: '9px', color: dm }}>Mediana pré-Copa → agora</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: dm }}>{medLabelBase} <span style={{ color: tx }}>→ {medLabel}</span>{dMeanPts != null && Math.abs(dMeanPts) >= 0.05 && <span style={{ fontSize: '10px', marginLeft: '5px', color: dMeanPts > 0 ? gn : rd }}>({dMeanPts > 0 ? '+' : ''}{dMeanPts.toFixed(2)} pts méd.)</span>}</div>
                    </div>
                  )}
                </div>
                <div style={{ maxWidth: '500px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 44px 44px', gap: '4px', marginBottom: '4px', fontSize: '9px', color: dm, fontWeight: 600 }}>
                    <span>Pts / Saldo</span><span></span><span style={{ textAlign: 'right' }}>Freq.</span><span style={{ textAlign: 'right' }}>Acum.</span>
                  </div>
                  {rows.filter(r => r.cnt / n * 100 >= 0.1).map((r, i) => {
                    const gdLabel = r.gd >= 0 ? '+' + r.gd : '' + r.gd;
                    const pct = r.cnt / n * 100;
                    const barW = r.cnt / maxCnt * 100;
                    const isMedian = r === median;
                    const isGreen = r.pts >= 4 || (r.pts === 3 && r.gd >= 0);
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 44px 44px', gap: '4px', alignItems: 'center', padding: '2px 0', background: isMedian ? `${gd}15` : 'transparent', borderRadius: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: isMedian ? gd : tx, fontFamily: 'monospace' }}>{r.pts}pts {gdLabel}{isMedian ? ' ←' : ''}</span>
                        <div style={{ background: `${bd}44`, borderRadius: '3px', height: '16px', overflow: 'hidden' }}>
                          <div style={{ background: isGreen ? '#22c55e' : r.pts >= 3 ? acc : '#ef4444', height: '100%', width: `${barW}%`, borderRadius: '3px', opacity: 0.8 }}/>
                        </div>
                        <span style={{ fontSize: '10px', color: pct > 10 ? tx : dm, textAlign: 'right', fontWeight: pct > 10 ? 600 : 400 }}>{pct.toFixed(1)}%</span>
                        <span style={{ fontSize: '9px', color: r.cumPct > 80 ? '#22c55e' : r.cumPct > 40 ? acc : dm, textAlign: 'right', fontWeight: 600 }}>{r.cumPct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '9px', color: dm, marginTop: '8px' }}>Acumulado de baixo para cima: um time com X pts e Y saldo avançaria como 3° em ~Acum.% das simulações. A linha dourada (←) marca a mediana.</div>

                {recAdvData && (() => {
                  const recs = Object.values(recAdvData).filter(r => r.cnt / mcN >= 0.02).sort((a, b) => b.pts - a.pts || b.gd - a.gd);
                  if (!recs.length) return null;
                  return (
                    <div style={{ marginTop: '18px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: bl }}>Avanço por registro (pontos / saldo)</div>
                      <div style={{ fontSize: '10px', color: dm, marginBottom: '10px' }}>Entre <strong>todas</strong> as seleções (1°, 2°, 3° ou 4°) que terminaram a fase de grupos com cada registro exato, quantas existem por simulação (média) e quantas avançam — contando inclusive quem foi 1° ou 2°. A última coluna isola o caso de 3° colocado.</div>
                      <div style={{ maxWidth: '560px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '92px 70px 1fr 52px 70px', gap: '6px', marginBottom: '4px', fontSize: '9px', color: dm, fontWeight: 600 }}>
                          <span>Pts / Saldo</span><span style={{ textAlign: 'right' }}>Times/sim</span><span></span><span style={{ textAlign: 'right' }}>% avança</span><span style={{ textAlign: 'right' }}>como 3°</span>
                        </div>
                        {recs.map((r, i) => {
                          const gdLabel = r.gd >= 0 ? '+' + r.gd : '' + r.gd;
                          const perSim = r.cnt / mcN;
                          const advPct = r.cnt ? r.adv / r.cnt * 100 : 0;
                          const adv3Pct = r.n3 ? r.adv3 / r.n3 * 100 : null;
                          const col = advPct >= 75 ? '#22c55e' : advPct >= 25 ? acc : '#ef4444';
                          return (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '92px 70px 1fr 52px 70px', gap: '6px', alignItems: 'center', padding: '2px 0' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: tx, fontFamily: 'monospace' }}>{r.pts}pts {gdLabel}</span>
                              <span style={{ fontSize: '10px', color: dm, textAlign: 'right' }}>{perSim.toFixed(2)}</span>
                              <div style={{ background: `${bd}44`, borderRadius: '3px', height: '14px', overflow: 'hidden' }}>
                                <div style={{ background: col, height: '100%', width: `${advPct}%`, borderRadius: '3px', opacity: 0.8 }}/>
                              </div>
                              <span style={{ fontSize: '10px', color: col, textAlign: 'right', fontWeight: 600 }}>{advPct.toFixed(0)}%</span>
                              <span style={{ fontSize: '9px', color: adv3Pct == null ? `${dm}66` : adv3Pct >= 50 ? '#22c55e' : acc, textAlign: 'right' }}>{adv3Pct == null ? '—' : adv3Pct.toFixed(0) + '%'}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: '9px', color: dm, marginTop: '8px' }}>"Times/sim" = média de seleções por simulação com aquele registro. "% avança" = entre essas, fração que se classificou (qualquer posição). "como 3°" = entre as que ficaram em 3° com esse registro, fração que entrou nos 8 melhores.</div>
                    </div>
                  );
                })()}
              </>);
            })()}

            {muView === 'scores' && scoreDistData && (() => {
              const { gs, ko } = scoreDistData;
              const gsTotal = Object.values(gs).reduce((s,v) => s + v, 0);
              const koTotal = Object.values(ko).reduce((s,v) => s + v, 0);
              const allScores = {};
              Object.entries(gs).forEach(([k,v]) => { allScores[k] = (allScores[k] || 0) + v; });
              Object.entries(ko).forEach(([k,v]) => { allScores[k] = (allScores[k] || 0) + v; });
              const total = gsTotal + koTotal;
              const src = scFilter === 'gs' ? gs : scFilter === 'ko' ? ko : allScores;
              const srcTotal = scFilter === 'gs' ? gsTotal : scFilter === 'ko' ? koTotal : total;
              const rows = Object.entries(src).map(([k, c]) => {
                const [a,b] = k.split('-').map(Number);
                return { score: k, cnt: c, pct: c / srcTotal * 100, goals: a + b, margin: a - b };
              }).sort((a,b) => b.cnt - a.cnt);
              const maxCnt = rows[0]?.cnt || 1;
              const avgGoals = rows.reduce((s,r) => s + r.goals * r.cnt, 0) / srcTotal;
              const drawPct = rows.filter(r => r.margin === 0).reduce((s,r) => s + r.pct, 0);
              // Jogos REAIS já disputados (teste de hipótese + comparação de placares observados)
              const obs = { gs: {}, ko: {}, gsN: 0, koN: 0, gsG: 0, koG: 0 };
              const addObs = (bucket, gA, gB) => { const sk = gA >= gB ? `${gA}-${gB}` : `${gB}-${gA}`; obs[bucket][sk] = (obs[bucket][sk] || 0) + 1; obs[bucket + 'N']++; obs[bucket + 'G'] += gA + gB; };
              GS.forEach((row, idx) => { const r = userRes[idx]; if (r && r.gA != null && r.gB != null) addObs('gs', r.gA, r.gB); });
              for (let mn = 73; mn <= 104; mn++) { const r = userRes['k' + mn]; if (r && r.gA != null && r.gB != null) addObs('ko', r.gA, r.gB); }
              const obsSrc = scFilter === 'gs' ? { ...obs.gs } : scFilter === 'ko' ? { ...obs.ko } : (() => { const m = { ...obs.gs }; Object.entries(obs.ko).forEach(([k, v]) => m[k] = (m[k] || 0) + v); return m; })();
              const obsN = scFilter === 'gs' ? obs.gsN : scFilter === 'ko' ? obs.koN : obs.gsN + obs.koN;
              const obsG = scFilter === 'gs' ? obs.gsG : scFilter === 'ko' ? obs.koG : obs.gsG + obs.koG;
              const obsMean = obsN ? obsG / obsN : 0;
              // Teste de hipótese (gols/jogo real vs modelo): z sobre a média, variância do próprio modelo.
              const varGoals = rows.reduce((s, r) => s + r.goals * r.goals * r.cnt, 0) / srcTotal - avgGoals * avgGoals;
              const se = obsN > 0 && varGoals > 0 ? Math.sqrt(varGoals / obsN) : 0;
              const zG = se > 0 ? (obsMean - avgGoals) / se : 0;
              const pG = se > 0 ? 2 * (1 - normCdf(Math.abs(zG))) : null;
              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: bl }}>Frequência de placares</div>
                <div style={{ fontSize: '10px', color: dm, marginBottom: '8px' }}>Placares normalizados (maior×menor). {scFilter === 'gs' ? `${gsTotal.toLocaleString()} jogos de grupo.` : scFilter === 'ko' ? `${koTotal.toLocaleString()} jogos de mata-mata (incluindo prorrogação).` : `${total.toLocaleString()} jogos totais.`}</div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                  {[['all','Todos'],['gs','Grupos'],['ko','Mata-mata']].map(([id,l]) => (
                    <SB key={id} active={scFilter === id} onClick={() => setScFilter(id)}>{l}</SB>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Gols/jogo (modelo)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: acc }}>{avgGoals.toFixed(2)}</div>
                  </div>
                  {obsN > 0 && (
                    <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bl}44`, padding: '8px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: dm }}>Gols/jogo (real, n={obsN})</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: bl }}>{obsMean.toFixed(2)} <span style={{ fontSize: '10px', color: obsMean - avgGoals > 0 ? gn : rd }}>({obsMean - avgGoals > 0 ? '+' : ''}{(obsMean - avgGoals).toFixed(2)})</span></div>
                    </div>
                  )}
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Empates (modelo)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: bl }}>{drawPct.toFixed(1)}%</div>
                  </div>
                </div>
                {obsN > 0 && pG != null && (
                  <div style={{ background: `${(pG < 0.05 ? rd : bl)}10`, border: `1px solid ${(pG < 0.05 ? rd : bl)}44`, borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', maxWidth: '560px' }} title="H0: os gols/jogo reais vêm da mesma distribuição do modelo. z = (média real − média modelo) / erro-padrão (variância do modelo / n). p bicaudal.">
                    <div style={{ fontSize: '11px', fontWeight: 700, color: pG < 0.05 ? rd : bl, marginBottom: '2px' }}>🧪 Teste: gols/jogo real vs simulação {obsN < 8 && <span style={{ color: acc, fontWeight: 400 }}>(amostra pequena — pouco poder)</span>}</div>
                    <div style={{ fontSize: '10px', color: tx, lineHeight: 1.5 }}>Real <strong>{obsMean.toFixed(2)}</strong> vs modelo <strong>{avgGoals.toFixed(2)}</strong> ({obsN} jogos) · z = <strong>{zG.toFixed(2)}</strong> · p = <strong>{pG < 0.001 ? '<0,001' : pG.toFixed(3)}</strong> → {pG < 0.05 ? <span style={{ color: rd, fontWeight: 700 }}>diferença significativa (5%): a Copa está {obsMean > avgGoals ? 'mais' : 'menos'} goleadora que o modelo previu</span> : <span style={{ color: gn, fontWeight: 700 }}>consistente com o modelo (sem diferença significativa)</span>}</div>
                  </div>
                )}
                <div style={{ maxWidth: '520px' }}>
                  {obsN > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 52px 50px 70px', gap: '6px', fontSize: '8px', color: dm, fontWeight: 600, padding: '0 0 3px', borderBottom: `1px solid ${bd}`, marginBottom: '2px' }}>
                      <span style={{ textAlign: 'center' }}>Placar</span><span /><span style={{ textAlign: 'right' }}>sims</span><span style={{ textAlign: 'right' }}>sim%</span><span style={{ textAlign: 'right' }}>real% (n)</span>
                    </div>
                  )}
                  {rows.map((r, i) => {
                    const obsC = obsSrc[r.score] || 0;
                    const obsP = obsN ? obsC / obsN * 100 : null;
                    return (
                    <div key={r.score} style={{ display: 'grid', gridTemplateColumns: obsN > 0 ? '44px 1fr 52px 50px 70px' : '44px 1fr 52px 44px', gap: '6px', alignItems: 'center', padding: '2px 0' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: r.margin === 0 ? bl : tx, textAlign: 'center', fontFamily: 'monospace' }}>{r.score}</span>
                      <div style={{ background: `${bd}44`, borderRadius: '3px', height: '16px', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ background: r.margin === 0 ? bl : r.margin >= 3 ? '#ef4444' : r.margin >= 2 ? '#f97316' : '#22c55e', height: '100%', width: `${r.cnt / maxCnt * 100}%`, borderRadius: '3px', opacity: 0.8 }}/>
                        {obsN > 0 && obsP > 0 && <div title={`real: ${obsP.toFixed(0)}%`} style={{ position: 'absolute', top: 0, height: '100%', width: '2px', background: tx, left: `${Math.min(100, obsP / (rows[0].pct || 1) * (rows[0].cnt / maxCnt * 100))}%` }} />}
                      </div>
                      <span style={{ fontSize: '9px', color: dm, textAlign: 'right' }}>{r.cnt.toLocaleString()}</span>
                      <span style={{ fontSize: '10px', color: r.pct > 10 ? tx : dm, textAlign: 'right', fontWeight: r.pct > 10 ? 600 : 400 }}>{r.pct.toFixed(1)}%</span>
                      {obsN > 0 && <span style={{ fontSize: '10px', textAlign: 'right', fontWeight: 700, color: obsC === 0 ? dm : Math.abs(obsP - r.pct) > 5 ? (obsP > r.pct ? gn : rd) : tx }}>{obsC === 0 ? '—' : `${obsP.toFixed(0)}% (${obsC})`}</span>}
                    </div>
                    );
                  })}
                </div>
              </>);
            })()}

            {muView === 'tie' && (
              !tieAccData ? <div style={{ padding: '40px', textAlign: 'center', color: dm }}>Rode a simulação</div> :
              (() => {
                const D = mcN || 1;
                const critColor = { h2hPts: '#3b82f6', h2hGd: '#3b82f6', h2hGf: '#3b82f6', gd: '#22c55e', gf: '#c9a84c', fifa: '#a855f7', rand: '#ef4444' };
                const rows = Object.entries(groups).map(([gn]) => {
                  const ta = tieAccData[gn] || { any: 0, byCrit: {}, teams: {} };
                  return { gn, pct: ta.any / D * 100, byCrit: ta.byCrit, teams: ta.teams };
                }).sort((a, b) => b.pct - a.pct);
                return (<>
                  <div style={{ fontSize: '11px', color: dm, marginBottom: '10px', lineHeight: 1.5 }}>
                    Probabilidade de que a ordem final de um grupo seja decidida por algum critério de desempate (além de pontos), conforme os anexos FIFA: <strong style={{ color: '#3b82f6' }}>confronto direto</strong> (pts→saldo→gols entre os empatados) → <strong style={{ color: '#22c55e' }}>saldo geral</strong> → <strong style={{ color: '#c9a84c' }}>gols gerais</strong> → <strong style={{ color: '#a855f7' }}>ranking FIFA</strong>. Conduta/cartões não é simulável e foi pulado.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '8px' }}>
                    {rows.map(({ gn, pct, byCrit, teams }) => {
                      const critList = Object.entries(byCrit).sort((a, b) => b[1] - a[1]);
                      const teamList = Object.entries(teams).map(([t, d]) => ({ t, pct: d.total / D * 100, byCrit: d.byCrit })).sort((a, b) => b.pct - a.pct);
                      return (
                        <div key={gn} style={crd}>
                          <div style={{ ...hdr, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Grupo {gn}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: pct > 50 ? '#f97316' : pct > 25 ? '#c9a84c' : bl }}>{pct.toFixed(1)}% <span style={{ fontSize: '9px', color: dm, fontWeight: 400 }}>desempate</span></span>
                          </div>
                          {critList.length === 0 ? <div style={{ fontSize: '10px', color: dm, padding: '6px 0' }}>Raramente decidido por desempate.</div> : <>
                            <div style={{ fontSize: '9px', color: dm, margin: '4px 0 2px' }}>Por critério acionado (% das sims):</div>
                            {critList.map(([c, cnt]) => (
                              <div key={c} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 42px', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontSize: '9px', color: critColor[c] || tx }}>{TIE_CRIT[c] || c}</span>
                                <div style={{ background: `${bd}44`, borderRadius: '3px', height: '12px', overflow: 'hidden' }}>
                                  <div style={{ background: critColor[c] || bl, height: '100%', width: `${cnt / D * 100}%`, opacity: 0.8 }}/>
                                </div>
                                <span style={{ fontSize: '9px', color: dm, textAlign: 'right' }}>{(cnt / D * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                            <div style={{ fontSize: '9px', color: dm, margin: '6px 0 2px', borderTop: `1px solid ${bd}`, paddingTop: '4px' }}>Times mais sujeitos a desempate:</div>
                            {teamList.slice(0, 4).map(({ t, pct: tp, byCrit: tbc }) => {
                              const top = Object.entries(tbc).sort((a, b) => b[1] - a[1])[0];
                              return (
                                <div key={t} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '1px' }}>
                                  <span>{fl(t)} {nm(t)}</span>
                                  <span style={{ color: dm }}>{tp.toFixed(1)}% <span style={{ color: critColor[top?.[0]] || dm, fontSize: '8px' }}>({TIE_CRIT[top?.[0]] || ''})</span></span>
                                </div>
                              );
                            })}
                          </>}
                        </div>
                      );
                    })}
                  </div>
                </>);
              })()
            )}

            {muView === 'duel' && confA !== confB && (() => {
              const a = rtBase(confA), b = rtBase(confB);
              const { la, lb } = cL(a, b, matchTilt(confA, confB));
              // disputa de pênaltis: conversão base 75%, leve vantagem ao favorito pela diferença de Elo
              const pkA = Math.max(.55, Math.min(.92, .75 + (a - b) / 14000)), pkB = Math.max(.55, Math.min(.92, .75 - (a - b) / 14000));
              const pen = penShootout(pkA, pkB);
              const N = 9;
              const P = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
              let W = 0, Dr = 0, L = 0; const cells = []; const margP = {};
              for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const p = P(la, i) * P(lb, j); cells.push({ i, j, p }); if (i > j) W += p; else if (i === j) Dr += p; else L += p; const m = i - j; margP[m] = (margP[m] || 0) + p; }
              const tot = W + Dr + L; W /= tot; Dr /= tot; L /= tot;
              const top = cells.sort((x, y) => y.p - x.p);
              // KO: avanço analítico (regulação → prorrogação ×0.33 → pênaltis pelo modelo de disputa)
              let advA = W; { const lae = la * .33, lbe = lb * .33; let etA = 0, etD = 0; for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const p = P(lae, i) * P(lbe, j); if (i > j) etA += p; else if (i === j) etD += p; } advA = W + Dr * (etA + etD * pen.winA); }
              const margins = Object.keys(margP).map(Number).sort((x, y) => x - y).filter(m => margP[m] / tot >= 0.001);
              const maxMarg = Math.max(...margins.map(m => margP[m]));
              // moda (placar mais provável) e mediana (pela margem) na regulação
              const modeReg = top[0];
              let cumM = 0, mStar = 0; const allMarg = Object.keys(margP).map(Number).sort((x, y) => x - y);
              for (const m of allMarg) { cumM += margP[m]; if (cumM >= tot / 2) { mStar = m; break; } }
              let bMed = -1, medI = 0, medJ = 0; for (let i = 0; i <= N; i++) { const j = i - mStar; if (j < 0 || j > N) continue; const p = P(la, i) * P(lb, j); if (p > bMed) { bMed = p; medI = i; medJ = j; } }
              // prorrogação e pênaltis (mata-mata)
              const lae = la * .33, lbe = lb * .33;
              let pReg = W + L; // decidido na regulação (não-empate)
              const etFinal = {}; let pPens = 0;
              for (let d = 0; d <= 7; d++) { const prd = P(la, d) * P(lb, d) / tot; for (let i = 0; i <= 5; i++) for (let j = 0; j <= 5; j++) { const k = (d + i) + '–' + (d + j); etFinal[k] = (etFinal[k] || 0) + prd * P(lae, i) * P(lbe, j); if (i === j) pPens += prd * P(lae, i) * P(lbe, j); } }
              const pET = Dr; // vai à prorrogação = empate na regulação
              let bET = -1, etK = ''; for (const k in etFinal) { if (etFinal[k] > bET) { bET = etFinal[k]; etK = k; } }
              // moda e mediana (pela margem) do placar final ao fim da prorrogação (condicional a ir à prorrogação)
              const etModeK = etK; const [etMi, etMj] = etModeK.split('–').map(Number);
              const etMargP = {}; for (const k in etFinal) { const [i, j] = k.split('–').map(Number); etMargP[i - j] = (etMargP[i - j] || 0) + etFinal[k]; }
              let etCum = 0, etMStar = 0; const etMargs = Object.keys(etMargP).map(Number).sort((x, y) => x - y);
              for (const m of etMargs) { etCum += etMargP[m]; if (etCum >= pET / 2) { etMStar = m; break; } }
              let etBMed = -1, etMedI = 0, etMedJ = 0; for (const k in etFinal) { const [i, j] = k.split('–').map(Number); if (i - j === etMStar && etFinal[k] > etBMed) { etBMed = etFinal[k]; etMedI = i; etMedJ = j; } }
              const penTop = Object.entries(pen.sc).sort((x, y) => y[1] - x[1]);
              const penModeK = penTop.length ? penTop[0][0] : '4-3';
              const [pkMi, pkMj] = penModeK.split('-').map(Number);
              const penWinner = pen.winA >= .5 ? confA : confB; const penWinPct = pen.winA >= .5 ? pen.winA : 1 - pen.winA;
              const moreBtn = (key, total, shown) => total > shown ? <button onClick={() => setConfExp(p => ({ ...p, [key]: !p[key] }))} style={{ marginTop: '4px', padding: '2px 8px', fontSize: '9px', fontWeight: 700, background: 'transparent', color: acc, border: `1px solid ${acc}55`, borderRadius: '4px', cursor: 'pointer' }}>{confExp[key] ? 'ver menos ▴' : `ver mais ${total - shown} ▾`}</button> : null;
              return (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: acc, marginBottom: '2px' }}>📊 Análise do confronto {confKO ? '(mata-mata)' : '(jogo normal)'}</div>
                  <div style={{ fontSize: '11px', color: dm, marginBottom: '10px' }}>Distribuição exata de resultados entre as duas seleções (equivale a infinitas simulações), com as configurações atuais de rating, tilts e favoritismo. Sem vantagem de mando (jogo neutro).</div>
                  {confA === confB ? <div style={{ color: dm, padding: '20px' }}>Escolha duas seleções diferentes.</div> : <>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ flex: 1, background: `${acc}11`, border: `1px solid ${acc}55`, borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: dm, textTransform: 'uppercase', letterSpacing: '.5px' }}>Placar moda{confKO && ' · tempo normal'}</div>
                        <div style={{ fontSize: '30px', fontWeight: 800, color: acc, fontFamily: 'monospace' }}>{modeReg.i}–{modeReg.j}</div>
                        <div style={{ fontSize: '9px', color: dm }}>{(modeReg.p / tot * 100).toFixed(1)}% dos jogos</div>
                      </div>
                      <div style={{ flex: 1, background: `${bl}11`, border: `1px solid ${bl}55`, borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', color: dm, textTransform: 'uppercase', letterSpacing: '.5px' }}>Placar mediano{confKO && ' · tempo normal'}</div>
                        <div style={{ fontSize: '30px', fontWeight: 800, color: bl, fontFamily: 'monospace' }}>{medI}–{medJ}</div>
                        <div style={{ fontSize: '9px', color: dm }}>margem {mStar >= 0 ? '+' + mStar : mStar} • 50º percentil</div>
                      </div>
                    </div>
                    {confKO && (<>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '90px', background: card, border: `1px solid ${bd}`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: dm }}>Decide na regulação</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: tx }}>{(pReg * 100).toFixed(0)}%</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '90px', background: card, border: `1px solid ${acc}44`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: dm }}>Vai à prorrogação</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: acc }}>{(pET * 100).toFixed(0)}%</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '90px', background: card, border: `1px solid ${bl}44`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: dm }}>Vai a pênaltis</div>
                          <div style={{ fontSize: '18px', fontWeight: 700, color: bl }}>{(pPens * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      {pET > 0 && (
                        <div style={{ background: `${acc}0c`, border: `1px solid ${acc}33`, borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: gd, marginBottom: '8px' }}>Caso o tempo normal termine empatado:</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '120px', background: card, border: `1px solid ${acc}44`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                              <div style={{ fontSize: '8px', color: dm, textTransform: 'uppercase' }}>Placar moda · pós-prorrog.</div>
                              <div style={{ fontSize: '24px', fontWeight: 800, color: acc, fontFamily: 'monospace' }}>{etMi}–{etMj}</div>
                              <div style={{ fontSize: '8px', color: dm }}>{etMi === etMj ? '🎯 vai a pênaltis' : (etMi > etMj ? nm(confA) : nm(confB)) + ' vence'} · {(bET / pET * 100).toFixed(0)}%</div>
                            </div>
                            <div style={{ flex: 1, minWidth: '120px', background: card, border: `1px solid ${bl}44`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                              <div style={{ fontSize: '8px', color: dm, textTransform: 'uppercase' }}>Placar mediano · pós-prorrog.</div>
                              <div style={{ fontSize: '24px', fontWeight: 800, color: bl, fontFamily: 'monospace' }}>{etMedI}–{etMedJ}</div>
                              <div style={{ fontSize: '8px', color: dm }}>{etMedI === etMedJ ? '🎯 vai a pênaltis' : (etMedI > etMedJ ? nm(confA) : nm(confB)) + ' vence'} · margem {etMStar >= 0 ? '+' + etMStar : etMStar}</div>
                            </div>
                            <div style={{ flex: 1, minWidth: '130px', background: card, border: `1px solid ${gn}44`, borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                              <div style={{ fontSize: '8px', color: dm, textTransform: 'uppercase' }}>Pênaltis · placar moda</div>
                              <div style={{ fontSize: '24px', fontWeight: 800, color: pkMi > pkMj ? gn : pkMi < pkMj ? bl : tx, fontFamily: 'monospace' }}>{pkMi}–{pkMj}</div>
                              <div style={{ fontSize: '8px', color: dm }}>{nm(penWinner)} leva {(penWinPct * 100).toFixed(0)}% · conversão {(pkA * 100).toFixed(0)}/{(pkB * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>)}
                    {confKO ? (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ flex: 1, background: card, borderRadius: '6px', padding: '10px', textAlign: 'center', border: `1px solid ${advA >= .5 ? gn + '66' : bd}` }}>
                          <div style={{ fontSize: '10px', color: dm }}>{fl(confA)} {nm(confA)} avança</div>
                          <div style={{ fontSize: '26px', fontWeight: 800, color: gn }}>{(advA * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ flex: 1, background: card, borderRadius: '6px', padding: '10px', textAlign: 'center', border: `1px solid ${advA < .5 ? bl + '66' : bd}` }}>
                          <div style={{ fontSize: '10px', color: dm }}>{fl(confB)} {nm(confB)} avança</div>
                          <div style={{ fontSize: '26px', fontWeight: 800, color: bl }}>{((1 - advA) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {[['V ' + nm(confA), W, gn], ['Empate', Dr, dm], ['V ' + nm(confB), L, bl]].map(([lab, v, c], i) => (
                          <div key={i} style={{ flex: 1, background: card, borderRadius: '6px', padding: '10px', textAlign: 'center', border: `1px solid ${bd}` }}>
                            <div style={{ fontSize: '10px', color: dm }}>{lab}</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: c }}>{(v * 100).toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: dm, marginBottom: '10px' }}>Placar esperado (média): <strong style={{ color: tx }}>{la.toFixed(2)} – {lb.toFixed(2)}</strong>{confKO && <span style={{ fontSize: '9px' }}> · avanço inclui prorrogação e pênaltis</span>}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: bl, marginBottom: '6px' }}>Placares mais prováveis {confKO && '(tempo normal)'}</div>
                        {(() => { const full = top.filter(c => c.p / tot >= 0.001); const lim = confExp.reg ? full.length : 12; return (<>
                          {full.slice(0, lim).map(({ i, j, p }, k) => (
                            <div key={k} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 42px', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: i > j ? gn : i < j ? bl : tx }}>{i}–{j}</span>
                              <div style={{ background: `${bd}44`, borderRadius: '3px', height: '13px', overflow: 'hidden' }}><div style={{ background: i > j ? gn : i < j ? bl : dm, height: '100%', width: `${p / top[0].p * 100}%`, opacity: .8 }}/></div>
                              <span style={{ fontSize: '10px', color: dm, textAlign: 'right' }}>{(p / tot * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                          {moreBtn('reg', full.length, 12)}
                        </>); })()}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '6px' }}>Distribuição da margem (gols {nm(confA)} − {nm(confB)})</div>
                        {(() => { const lim = confExp.marg ? margins.length : 9; const shown = margins.slice(0, lim); return (<>
                          {shown.map(m => (
                            <div key={m} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 42px', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'monospace', color: m > 0 ? gn : m < 0 ? bl : tx }}>{m > 0 ? '+' + m : m}</span>
                              <div style={{ background: `${bd}44`, borderRadius: '3px', height: '13px', overflow: 'hidden' }}><div style={{ background: m > 0 ? gn : m < 0 ? bl : dm, height: '100%', width: `${margP[m] / maxMarg * 100}%`, opacity: .8 }}/></div>
                              <span style={{ fontSize: '10px', color: dm, textAlign: 'right' }}>{(margP[m] / tot * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                          {moreBtn('marg', margins.length, 9)}
                        </>); })()}
                      </div>
                    </div>
                    {confKO && pET > 0 && (() => {
                      const etAll = Object.entries(etFinal).sort((x, y) => y[1] - x[1]); const etTop = etAll.slice(0, confExp.et ? etAll.length : 10);
                      const etMax = etTop.length ? etTop[0][1] : 1;
                      return (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: gd, marginBottom: '2px' }}>Placares ao fim da prorrogação (se houver)</div>
                          <div style={{ fontSize: '9px', color: dm, marginBottom: '6px' }}>Condicional a ir à prorrogação ({(pET * 100).toFixed(0)}% dos jogos). 🎯 = empate ao fim da prorrogação, que segue para pênaltis ({(pPens / pET * 100).toFixed(0)}% das prorrogações).</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                            {etTop.map(([k, p], idx) => { const [pi, pj] = k.split('–').map(Number); return (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 42px', gap: '6px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: pi > pj ? gn : pi < pj ? bl : tx }}>{k}{pi === pj ? ' 🎯' : ''}</span>
                                <div style={{ background: `${bd}44`, borderRadius: '3px', height: '13px', overflow: 'hidden' }}><div style={{ background: pi > pj ? gn : pi < pj ? bl : dm, height: '100%', width: `${p / etMax * 100}%`, opacity: .8 }}/></div>
                                <span style={{ fontSize: '10px', color: dm, textAlign: 'right' }}>{(p / pET * 100).toFixed(1)}%</span>
                              </div>
                            ); })}
                          </div>
                          {moreBtn('et', etAll.length, 10)}
                        </div>
                      );
                    })()}
                    {confKO && pPens > 0 && (() => {
                      const penAll = penTop; const pl = penAll.slice(0, confExp.pen ? penAll.length : 10); const pMax = pl.length ? pl[0][1] : 1; const tNep = 40000;
                      return (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: gn, marginBottom: '2px' }}>Distribuição dos pênaltis (na ordem {nm(confA)}–{nm(confB)})</div>
                          <div style={{ fontSize: '9px', color: dm, marginBottom: '6px' }}>Gols convertidos na disputa, condicional a haver disputa ({(pPens * 100).toFixed(0)}% dos jogos). Conversão base 75%, vantagem do favorito por chute.</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                            {pl.map(([k, c], idx) => { const [pi, pj] = k.split('-').map(Number); return (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 42px', gap: '6px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: pi > pj ? gn : bl }}>{pi}–{pj}</span>
                                <div style={{ background: `${bd}44`, borderRadius: '3px', height: '13px', overflow: 'hidden' }}><div style={{ background: pi > pj ? gn : bl, height: '100%', width: `${c / pMax * 100}%`, opacity: .8 }}/></div>
                                <span style={{ fontSize: '10px', color: dm, textAlign: 'right' }}>{(c / tNep * 100).toFixed(1)}%</span>
                              </div>
                            ); })}
                          </div>
                          {moreBtn('pen', penAll.length, 10)}
                        </div>
                      );
                    })()}
                  </>}
                </div>
              );
            })()}
            {muView === 'path' && (() => {
              if (!tpcData) return <div style={{ padding: '24px', textAlign: 'center', color: dm, fontSize: '12px' }}>Rode a simulação.</div>;
              const RDS = [['r32', 'R32'], ['r16', 'R16'], ['qf', 'QF'], ['sf', 'SF'], ['fin', 'Final']];
              const posLabel = { '1': '1°', '2': '2°', '3': '3°' };
              const teams = all.slice().sort((a, b) => (res?.[b]?.ch || 0) - (res?.[a]?.ch || 0));
              return (<>
                <div style={{ fontSize: '9px', color: dm, marginBottom: '10px' }}>
                  Para cada time e cada posição no grupo (1°/2°/3°): o adversário mais provável em cada fase do mata-mata (com a % de enfrentá-lo, dado que chegou à fase) e a chance condicional de título se terminar naquela posição. <strong style={{ color: bl }}>Elo méd. caminho</strong> = força média dos adversários ao longo da rota (cada fase ~Elo ponderado por frequência). Empilhado, ordenado por chance de título.
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {teams.map(team => {
                    const tp = tpcData[team] || {};
                    const grp = Object.entries(groups).find(([, ts]) => ts.includes(team))?.[0];
                    const totalForTeam = Object.values(tp).reduce((s, d) => s + (d.n || 0), 0);
                    if (!grp || totalForTeam === 0) return null;
                    const overall = (res?.[team]?.ch || 0);
                    const rows = ['1', '2', '3'].map(pn => {
                      const d = tp[grp + pn];
                      if (!d || !d.n) return null;
                      const finishFreq = (d.n / totalForTeam) * 100;
                      const condCh = (d.ch / d.n) * 100;
                      const path = RDS.map(([rk]) => {
                        const ent = Object.entries(d[rk] || {});
                        if (!ent.length) return null;
                        ent.sort((a, b) => b[1] - a[1]);
                        const [opp, cnt] = ent[0];
                        const reached = ent.reduce((s, [, c]) => s + c, 0);
                        // Elo médio dos adversários nesta fase, ponderado por quantas vezes cada um aparece.
                        const avgElo = reached ? ent.reduce((s, [o, c]) => s + rt(o) * c, 0) / reached : 0;
                        return { opp, faceProb: reached ? (cnt / reached) * 100 : 0, avgElo };
                      });
                      // Elo médio do caminho = média das fases alcançadas (peso igual por fase).
                      const eloSteps = path.filter(s => s && s.avgElo > 0);
                      const pathElo = eloSteps.length ? Math.round(eloSteps.reduce((s, x) => s + x.avgElo, 0) / eloSteps.length) : 0;
                      // Mesmo cálculo na baseline pré-Copa (rtRaw = Elo original) p/ o Δ.
                      const db = baseAgg?.tpc?.[team]?.[grp + pn];
                      let pathEloBase = 0;
                      if (db) {
                        const bs = RDS.map(([rk]) => { const ent = Object.entries(db[rk] || {}); if (!ent.length) return 0; const reached = ent.reduce((s, [, c]) => s + c, 0); return reached ? ent.reduce((s, [o, c]) => s + rtRaw(o) * c, 0) / reached : 0; }).filter(v => v > 0);
                        pathEloBase = bs.length ? Math.round(bs.reduce((s, x) => s + x, 0) / bs.length) : 0;
                      }
                      return { pn, finishFreq, condCh, path, pathElo, pathEloBase };
                    }).filter(Boolean);
                    if (!rows.length) return null;
                    return (
                      <div key={team} style={{ background: card, borderRadius: '6px', padding: '8px 10px', border: `1px solid ${bd}` }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                          {fl(team)} {nm(team)}
                          <span style={{ color: gd, fontSize: '11px' }}>🏆 {overall.toFixed(1)}%</span>
                          <span style={{ color: dm, fontSize: '9px' }}>grupo {grp}</span>
                        </div>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {rows.map(r => (
                            <div key={r.pn} style={{ display: 'grid', gridTemplateColumns: '128px 1fr', gap: '8px', alignItems: 'center', padding: '4px 6px', background: '#0d111d', borderRadius: '4px' }}>
                              <div style={{ fontSize: '10px' }}>
                                <span style={{ fontWeight: 700, color: acc }}>{posLabel[r.pn]}</span>
                                <span style={{ color: dm }}> · termina {r.finishFreq.toFixed(0)}%</span>
                                <div style={{ color: gd, fontWeight: 700, fontSize: '11px' }}>🏆 {r.condCh.toFixed(1)}%</div>
                                {r.pathElo > 0 && <div style={{ color: bl, fontSize: '9px', fontWeight: 600 }} title="Elo médio dos adversários ao longo do caminho mais provável (média das fases alcançadas, ponderada pela frequência de cada adversário). ▲ = caminho ficou mais difícil desde o início da Copa.">Elo méd. caminho: {r.pathElo}{r.pathEloBase > 0 && (() => { const d = r.pathElo - r.pathEloBase; if (Math.abs(d) < 1) return null; return <span title={`início da Copa: ${r.pathEloBase}`} style={{ marginLeft: '4px', fontWeight: 700, color: d > 0 ? rd : gn }}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>; })()}</div>}
                              </div>
                              <div style={{ fontSize: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px' }}>
                                {RDS.map(([rk, rl], j) => {
                                  const step = r.path[j];
                                  return (
                                    <span key={rk} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                      {j > 0 && <span style={{ color: dm, margin: '0 3px' }}>→</span>}
                                      <span style={{ color: dm, fontSize: '8px', marginRight: '2px' }}>{rl}</span>
                                      {step ? <>{fl(step.opp)} {nm(step.opp)} <span style={{ color: dm }}>{step.faceProb.toFixed(0)}%</span>{step.avgElo > 0 && <span style={{ color: bl, fontSize: '8px', marginLeft: '2px' }}>~{Math.round(step.avgElo)}</span>}</> : <span style={{ color: dm }}>—</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>);
            })()}
          </div>
        )}
        {tab === 'results' && (
          <div style={cs}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: acc }}>📝 Resultados & Probabilidades</div>
            <div style={{ fontSize: '10px', color: dm, marginBottom: '8px' }}>{nFxGS}/{GS.length} grupos • {nFxKO}/32 mata-mata preenchidos. Preencha e rode a simulação.</div>
            {resultsDirty && !running && (
              <div onClick={doMC} title="Clique para rerodar o Monte Carlo com os resultados atuais" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', marginBottom: '10px', background: `${rd}1a`, border: `1px solid ${rd}66`, borderRadius: '6px', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <span style={{ fontSize: '11px', color: tx, fontWeight: 600 }}>Resultados digitados ainda <strong style={{ color: rd }}>não aplicados</strong> às probabilidades. <span style={{ color: acc }}>Clique aqui (ou em ▶ no topo) para rerodar.</span></span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <SB active={resView === 'games'} onClick={() => setResView('games')}>⚽ Jogos</SB>
              <SB active={resView === 'standings'} onClick={() => setResView('standings')}>📊 Classificação</SB>
              <SB active={resView === 'filter'} onClick={() => setResView('filter')}>🔎 Filtrar</SB>
              <SB active={resView === 'ko'} onClick={() => setResView('ko')}>🥊 Mata-mata</SB>
              {nFx > 0 && <button onClick={() => { const init = {}; Object.entries(BUILT_IN_RESULTS).forEach(([k, v]) => { if (k.startsWith('k')) init[k] = { ...v }; else { const idx = (+k) - 1; if (idx >= 0 && idx < GS.length) init[idx] = { ...v }; } }); setUserRes(init); }} style={{ padding: '3px 8px', fontSize: '9px', color: '#ef4444', background: 'transparent', border: '1px solid #ef444444', borderRadius: '3px', cursor: 'pointer', marginLeft: '8px' }}>Limpar resultados</button>}
              <span style={{ fontSize: '9px', color: dm, marginLeft: 'auto', alignSelf: 'center' }}>💾 salvo neste navegador</span>
            </div>
            <div style={{ fontSize: '9px', color: dm, marginBottom: '8px', lineHeight: 1.5 }}>Os resultados que você preencher e suas configurações (rating, tilt, nº de sims, repescagens) ficam guardados localmente neste navegador — feche e reabra que continuam aqui. Limpar nas configurações do navegador (ou outro dispositivo/aba anônima) começa do zero.</div>
            {(resView === 'games' || resView === 'ko') && (
              <div style={{ fontSize: '8px', color: dm, marginBottom: '8px' }}>Cada jogo mostra <strong style={{ color: acc }}>moda</strong> (placar mais provável) e <strong style={{ color: bl }}>med</strong> (mediana pela margem — 50º percentil), com a chance de cada um.</div>
            )}

            {/* Live standings from entered results */}
            {resView === 'standings' && nFx > 0 && (() => {
              const tb = {};
              Object.entries(groups).forEach(([gn, ts]) => ts.forEach(t => { tb[t] = { g: gn, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0, p: 0 }; }));
              GS.forEach(([gn, hi, ai], idx) => {
                const fx = userRes[idx];
                if (fx?.gA == null || fx?.gB == null) return;
                const h = groups[gn][hi], a = groups[gn][ai];
                tb[h].gf += fx.gA; tb[h].ga += fx.gB; tb[h].gd += fx.gA - fx.gB; tb[h].p++;
                tb[a].gf += fx.gB; tb[a].ga += fx.gA; tb[a].gd += fx.gB - fx.gA; tb[a].p++;
                if (fx.gA > fx.gB) { tb[h].pts += 3; tb[h].w++; tb[a].l++; }
                else if (fx.gA < fx.gB) { tb[a].pts += 3; tb[a].w++; tb[h].l++; }
                else { tb[h].pts++; tb[a].pts++; tb[h].d++; tb[a].d++; }
              });
              return (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: bl, marginBottom: '6px' }}>📊 Classificação parcial (resultados inseridos)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '6px' }}>
                    {Object.entries(groups).map(([gn, ts]) => {
                      const sorted = ts.slice().sort((a, b) => tb[b].pts - tb[a].pts || tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf);
                      const hasGames = sorted.some(t => tb[t].p > 0);
                      if (!hasGames) return null;
                      return (
                        <div key={gn} style={{ background: card, borderRadius: '5px', border: `1px solid ${bd}`, overflow: 'hidden', fontSize: '10px' }}>
                          <div style={{ padding: '3px 8px', fontWeight: 700, background: `${acc}15`, borderBottom: `1px solid ${bd}`, fontSize: '11px' }}>Grupo {gn}</div>
                          {sorted.map((t, i) => (
                            <div key={t} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 20px 36px 20px', alignItems: 'center', padding: '2px 6px', gap: '3px' }}>
                              <span>{fl(t)}</span>
                              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nm(t)}</span>
                              <span style={{ textAlign: 'center', fontWeight: 700 }}>{tb[t].pts}</span>
                              <span style={{ textAlign: 'center', color: dm }}>{tb[t].w}-{tb[t].d}-{tb[t].l}</span>
                              <span style={{ textAlign: 'center', color: tb[t].gd > 0 ? '#22c55e' : tb[t].gd < 0 ? '#ef4444' : dm }}>{tb[t].gd > 0 ? '+' : ''}{tb[t].gd}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>
              );
            })()}
            {resView === 'standings' && nFx === 0 && <div style={{ padding: '30px', textAlign: 'center', color: dm, fontSize: '11px' }}>Preencha resultados na aba ⚽ Jogos para ver a classificação.</div>}

            {/* Filtro condicional (amostragem por rejeição) */}
            {resView === 'filter' && (() => {
              const teamsSorted = [...all].sort((a, b) => nm(a).localeCompare(nm(b)));
              const condLabel = (c) => {
                const T = `${fl(c.team)} ${nm(c.team)}`;
                if (c.type === 'faces') return `${T} enfrenta ${fl(c.target)} ${nm(c.target)} ${ROUND_LABEL[c.round || 'any']}`;
                return `${T} ${COND_LABEL[c.type]}`;
              };
              const addCond = () => {
                const c = { team: condForm.team, type: condForm.type };
                if (condForm.type === 'faces') {
                  if (condForm.target === condForm.team) { alert('Escolha dois times diferentes.'); return; }
                  c.target = condForm.target; c.round = condForm.round;
                }
                // evita duplicata exata
                if (conditions.some(x => JSON.stringify(x) === JSON.stringify(c))) return;
                setConditions(prev => [...prev, c]);
              };
              return (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: acc, marginBottom: '4px' }}>🔎 Filtrar (probabilidade condicional)</div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '8px', lineHeight: 1.5 }}>Mantém apenas as simulações em que <strong>todas</strong> as condições acontecem e recalcula as probabilidades sobre elas — ou seja, P(tudo | condições). Diferente de fixar um resultado: aqui o caminho continua aleatório, só os mundos que batem as condições são contados. Use para perguntas como "se o Brasil chega à final, quem ele mais encontra?".</div>

                  {/* Condições ativas */}
                  {conditions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                      {conditions.map((c, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${acc}1a`, border: `1px solid ${acc}55`, borderRadius: '14px', padding: '3px 8px 3px 10px', fontSize: '10px', color: tx }}>
                          {condLabel(c)}
                          <button onClick={() => setConditions(prev => prev.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: rd, cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      ))}
                      <button onClick={() => setConditions([])} style={{ fontSize: '9px', color: rd, background: 'transparent', border: `1px solid ${rd}44`, borderRadius: '14px', padding: '3px 10px', cursor: 'pointer' }}>Limpar tudo</button>
                    </div>
                  ) : <div style={{ fontSize: '10px', color: dm, fontStyle: 'italic', marginBottom: '8px' }}>Nenhuma condição — o MC roda sem filtro (probabilidades incondicionais).</div>}

                  {/* Construtor */}
                  <div style={{ background: card, border: `1px solid ${bd}`, borderRadius: '6px', padding: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                    <select value={condForm.team} onChange={e => setCondForm(f => ({ ...f, team: e.target.value }))} style={{ padding: '4px 6px', background: '#0d111d', color: acc, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      {teamsSorted.map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                    </select>
                    <select value={condForm.type} onChange={e => setCondForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '4px 6px', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '11px' }}>
                      {COND_TYPES.map(ty => <option key={ty} value={ty}>{ty === 'faces' ? 'enfrenta…' : COND_LABEL[ty]}</option>)}
                    </select>
                    {condForm.type === 'faces' && <>
                      <select value={condForm.target} onChange={e => setCondForm(f => ({ ...f, target: e.target.value }))} style={{ padding: '4px 6px', background: '#0d111d', color: bl, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {teamsSorted.map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                      </select>
                      <select value={condForm.round} onChange={e => setCondForm(f => ({ ...f, round: e.target.value }))} style={{ padding: '4px 6px', background: '#0d111d', color: dm, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '11px' }}>
                        {Object.entries(ROUND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </>}
                    <button onClick={addCond} style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 700, color: '#000', background: acc, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Adicionar</button>
                  </div>

                  {/* Filtro instantâneo: aplicado em memória ao mudar condições */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {mcMeta && mcMeta.conds && mcMeta.conds.length > 0 ? (
                      <span style={{ fontSize: '10px', color: mcMeta.nAccepted < 200 ? rd : gn }}>
                        ✓ {mcMeta.nAccepted.toLocaleString()} de {mcMeta.n.toLocaleString()} sims passaram no filtro → P(condições) ≈ {(mcMeta.nAccepted / mcMeta.n * 100).toFixed(2)}%
                      </span>
                    ) : <span style={{ fontSize: '10px', color: dm }}>Sem condições — probabilidades incondicionais sobre {(+nSim || 0).toLocaleString()} sims.</span>}
                  </div>
                  {mcMeta && mcMeta.conds && mcMeta.conds.length > 0 && mcMeta.nAccepted === 0 && <div style={{ fontSize: '10px', color: rd, marginTop: '8px', background: '#ef444415', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ef444444' }}>Nenhuma simulação satisfez as condições (evento muito raro ou impossível com os resultados já fixados). Aumente o nº de simulações na barra superior e rode o MC de novo para ter mais mundos no pool.</div>}
                  <div style={{ fontSize: '9px', color: dm, marginTop: '8px', lineHeight: 1.5 }}>💡 O filtro é aplicado <strong>na hora</strong>, em memória — ao adicionar/remover condições todas as abas (📊 Probs, 🌳 Bracket, 🔀 Cruzamentos…) atualizam instantaneamente, sem re-simular e sem ruído (sempre o mesmo universo de sims). A taxa de aceitação é a estimativa de P(condições). Para condicionar eventos raros com precisão, aumente o nº de simulações na barra superior antes de filtrar.</div>
                </div>
              );
            })()}

            {resView === 'ko' && (() => {
              const st = resolveStandings(groups, userRes);
              const ko = resolveKO(st, userRes);
              const phaseOrder = ['R32','R16','QF','SF','3°','FIN'];
              const phaseLabels = {R32:'1/16 (R32)',R16:'Oitavas (R16)',QF:'Quartas (QF)',SF:'Semifinais (SF)','3°':'Terceiro lugar','FIN':'FINAL'};
              const byPhase = {};
              for (let mn = 73; mn <= 104; mn++) { const m = ko[mn]; if (!byPhase[m.ph]) byPhase[m.ph] = []; byPhase[m.ph].push(m); }
              const setKO = (mn, field, val) => setUserRes(p => {
                const k = 'k' + mn;
                const cur = { ...p, [k]: { ...p[k], [field]: val, home: ko[mn].h, away: ko[mn].a } };
                if (val === undefined) delete cur[k][field];
                return cur;
              });
              return (
                <div>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '8px', background: card, padding: '6px 10px', borderRadius: '4px', border: `1px solid ${bd}` }}>
                    💡 Os times só aparecem após todos os 6 jogos do grupo serem preenchidos. Os 3°s lugares precisam de <strong>todos os 12 grupos</strong> resolvidos. Se o placar dos 90 min é empate, escolha o vencedor nos pênaltis. Previsão estática: % head-to-head pelo Elo/PELE/tilt atual.
                  </div>
                  {phaseOrder.map(ph => byPhase[ph] && (
                    <div key={ph} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: gd, padding: '3px 0', borderBottom: `1px solid ${bd}33`, marginBottom: '4px' }}>🥊 {phaseLabels[ph]}</div>
                      {byPhase[ph].map(m => {
                        const ready = m.h && m.a;
                        const fx = m.fx;
                        const hasFx = fx?.gA != null && fx?.gB != null;
                        const tie = hasFx && fx.gA === fx.gB;
                        const winner = m.winner;
                        const pr = ready ? mProbs(efCity(m.h, KO_CITY[m.mn]), efCity(m.a, KO_CITY[m.mn]), m.h, m.a) : null;
                        const mMod = ready ? scoreStat(efCity(m.h, KO_CITY[m.mn]), efCity(m.a, KO_CITY[m.mn]), m.h, m.a, 'mode') : null;
                        const mMed = ready ? scoreStat(efCity(m.h, KO_CITY[m.mn]), efCity(m.a, KO_CITY[m.mn]), m.h, m.a, 'median') : null;
                        return (
                          <div key={m.mn} style={{ background: card, borderRadius: '5px', padding: '6px 10px', marginBottom: '3px', border: `1px solid ${hasFx ? gn + '44' : ready ? bl + '33' : bd}`, opacity: ready ? 1 : 0.55 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                              <span style={{ fontSize: '9px', color: dm }}>M{m.mn} • {DOW(KO_DATE[m.mn])} {KO_DATE[m.mn]} • {KO_BRT[m.mn]} BRT • {KO_CITY[m.mn]} • <span style={{ color: bl }}>{m.l}</span></span>
                              {ready && pr && <div style={{ display: 'flex', gap: '6px', fontSize: '9px', alignItems: 'center' }}>
                                <span style={{ color: acc }} title="Placar mais provável (tempo normal)">⚽ {mMod.a}–{mMod.b} <span style={{ color: `${acc}99` }}>{mMod.pct.toFixed(0)}%</span></span>
                                <span style={{ color: bl }} title="Mediana pela margem (tempo normal)">med {mMed.a}–{mMed.b} <span style={{ color: `${bl}99` }}>{mMed.pct.toFixed(0)}%</span></span>
                                <span style={{ color: bd }}>|</span>
                                <span style={{ color: gn }}>{pr.pH.toFixed(0)}%</span>
                                <span style={{ color: dm }}>E {pr.pD.toFixed(0)}%</span>
                                <span style={{ color: bl }}>{pr.pA.toFixed(0)}%</span>
                                <button onClick={() => setKoHist(h => h === m.mn ? null : m.mn)} title="Confrontos anteriores em Copas entre os dois times" style={{ padding: '0px 5px', fontSize: '10px', background: koHist === m.mn ? `${gd}33` : 'transparent', color: koHist === m.mn ? gd : dm, border: `1px solid ${koHist === m.mn ? gd : bd}`, borderRadius: '3px', cursor: 'pointer' }}>📜</button>
                              </div>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1fr', alignItems: 'center', gap: '4px' }}>
                              <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: winner === m.h ? 700 : 500, color: !ready ? dm : winner === m.h ? gn : tx }}>
                                {ready ? `${fl(m.h)} ${nm(m.h)}` : <span style={{ fontStyle: 'italic', color: dm }}>aguardando…</span>}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                                <input type="number" min="0" max="20" disabled={!ready} value={fx?.gA ?? ''} placeholder="-"
                                  onChange={e => { const v = e.target.value; setKO(m.mn, 'gA', v === '' ? undefined : +v); }}
                                  style={{ width: '32px', padding: '3px', textAlign: 'center', background: ready ? '#0d111d' : '#1a1a2a', color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '13px', fontWeight: 700, opacity: ready ? 1 : 0.4 }} />
                                <span style={{ color: dm }}>×</span>
                                <input type="number" min="0" max="20" disabled={!ready} value={fx?.gB ?? ''} placeholder="-"
                                  onChange={e => { const v = e.target.value; setKO(m.mn, 'gB', v === '' ? undefined : +v); }}
                                  style={{ width: '32px', padding: '3px', textAlign: 'center', background: ready ? '#0d111d' : '#1a1a2a', color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '13px', fontWeight: 700, opacity: ready ? 1 : 0.4 }} />
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: winner === m.a ? 700 : 500, color: !ready ? dm : winner === m.a ? gn : tx }}>
                                {ready ? `${fl(m.a)} ${nm(m.a)}` : <span style={{ fontStyle: 'italic', color: dm }}>aguardando…</span>}
                              </div>
                            </div>
                            {tie && ready && (
                              <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '10px', alignItems: 'center' }}>
                                <span style={{ color: '#f97316' }}>⚠ Empate em 90'. Vencedor pênaltis:</span>
                                <button onClick={() => setKO(m.mn, 'pw', 'A')} style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 600, background: (fx.pw || 'A') === 'A' ? `${gn}33` : 'transparent', color: (fx.pw || 'A') === 'A' ? gn : dm, border: `1px solid ${(fx.pw || 'A') === 'A' ? gn : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{fl(m.h)} {nm(m.h)}</button>
                                <button onClick={() => setKO(m.mn, 'pw', 'B')} style={{ padding: '2px 6px', fontSize: '10px', fontWeight: 600, background: fx.pw === 'B' ? `${gn}33` : 'transparent', color: fx.pw === 'B' ? gn : dm, border: `1px solid ${fx.pw === 'B' ? gn : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{fl(m.a)} {nm(m.a)}</button>
                              </div>
                            )}
                            {hasFx && ready && (() => {
                              const s = surpriseOf(efCity(m.h, KO_CITY[m.mn]), efCity(m.a, KO_CITY[m.mn]), m.h, m.a, fx.gA, fx.gB);
                              const qi = qualImpact('k' + m.mn);
                              return (
                                <div style={{ marginTop: '3px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexWrap: 'wrap' }}>
                                  <span title="Surpresa em bits (−log₂ da prob. pré-jogo, 90 min — pênaltis não entram). Placar = aquele placar exato; Resultado = o desfecho 1X2 (quem venceu/empatou, a 'zebra').">🎯 surpresa{tie ? " (90')" : ''} — <span style={{ color: s.bitsExact > 6 ? rd : s.bitsExact > 4.5 ? '#f97316' : acc, fontWeight: 700 }}>placar {s.bitsExact.toFixed(1)} bits</span> <span style={{ color: dm }}>({(s.pExact * 100).toFixed(1)}%)</span> · <span style={{ color: s.bitsOut > 6 ? rd : s.bitsOut > 4.5 ? '#f97316' : bl, fontWeight: 700 }}>resultado {s.bitsOut.toFixed(1)} bits</span> <span style={{ color: dm }}>({(s.pOut * 100).toFixed(0)}%)</span></span>
                                  {qi && <span style={{ color: qi.dW > 15 ? rd : qi.dW > 5 ? '#f97316' : dm }} title={`Chance de ${nm(qi.winner)} avançar ia de ${qi.pAdvW.toFixed(0)}% → 100% (analítico: 90' + prorrogação + pênaltis, espelha o modelo do torneio)`}>⚡ avança: {nm(qi.winner)} +{qi.dW.toFixed(1)} p.p.</span>}
                                </div>
                              );
                            })()}
                            {ready && koHist === m.mn && h2hBox(m.h, m.a)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}

            {resView === 'games' && (() => {
              const byDate = {};
              GS.forEach(([gn, hi, ai, date, city], idx) => {
                if (resGrp !== 'all' && gn !== resGrp) return; // filtro por grupo
                if (!byDate[date]) byDate[date] = [];
                byDate[date].push({ idx, gn, home: groups[gn][hi], away: groups[gn][ai], date, city, brt: GS_BRT[idx] });
              });
              const filterRow = (
                <div key="__filter" style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', color: dm }}>Grupo:</span>
                  <SB active={resGrp === 'all'} onClick={() => setResGrp('all')}>Todos</SB>
                  {Object.keys(groups).map(g => <SB key={g} active={resGrp === g} onClick={() => setResGrp(g)}>{g}</SB>)}
                </div>
              );
              return [filterRow, ...Object.entries(byDate).sort((a, b) => dateKey(a[0]) - dateKey(b[0])).map(([date, ms]) => {
                ms.sort((a, b) => a.brt.localeCompare(b.brt));
                return (
                <div key={date} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: gd, padding: '3px 0', borderBottom: `1px solid ${bd}33`, marginBottom: '4px' }}>📆 {DOW(date)} {date} ({ms.length} jogos)</div>
                  {ms.map(m => {
                    const _im = injuries[m.idx] || {};
                    const _eH = efCity(m.home, m.city) - (_im.h || 0) * INJ_ELO;
                    const _eA = efCity(m.away, m.city) - (_im.a || 0) * INJ_ELO;
                    const pr = mProbs(_eH, _eA, m.home, m.away);
                    const mMod = scoreStat(_eH, _eA, m.home, m.away, 'mode');
                    const mMed = scoreStat(_eH, _eA, m.home, m.away, 'median');
                    const fx = userRes[m.idx];
                    const hasFx = fx?.gA != null && fx?.gB != null;
                    const isLive = liveCard === m.idx;
                    const LI_DEF = { tau: 0, gA: 0, gB: 0, redsA: 0, redsB: 0, s1: 3, s2: 6, csA: '', csB: '', ev: [] };
                    const li = { ...LI_DEF, ...(liveInputs[m.idx] || {}) };
                    const liS1 = Math.max(0, Math.min(15, +li.s1 || 0)), liS2 = Math.max(0, Math.min(15, +li.s2 || 0));
                    const liTau = Math.max(0, Math.min(90 + liS1 + liS2, +li.tau || 0)); // clamp: reduzir acréscimos depois de mover o slider não pode estourar
                    const hasEv = li.ev.length > 0; // com eventos minutados, o estado do jogo em τ deriva deles
                    const liSt = hasEv ? evState(li.ev, liTau) : { gA: +li.gA || 0, gB: +li.gB || 0, redsA: +li.redsA || 0, redsB: +li.redsB || 0 };
                    const liveP = isLive ? liveProbs(_eH, _eA, m.home, m.away, { tau: liTau, ...liSt, s1: liS1, s2: liS2 }) : null;
                    const setLI = (field, val) => setLiveInputs(p => ({ ...p, [m.idx]: { ...LI_DEF, ...(p[m.idx] || {}), [field]: val } }));
                    return (
                      <div key={m.idx} style={{ background: card, borderRadius: '5px', padding: '6px 10px', marginBottom: '3px', border: `1px solid ${isLive ? acc : hasFx ? gn + '44' : bd}` }}>
                        <div onClick={() => setLiveCard(isLive ? null : m.idx)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', cursor: 'pointer', userSelect: 'none' }}>
                          <span style={{ fontSize: '9px', color: dm }}>{isLive ? '▼' : '▶'} Grupo {m.gn} • {GS_BRT[m.idx]} BRT • {m.city}</span>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '9px', alignItems: 'center' }}>
                            <span style={{ color: acc }} title="Placar mais provável (moda)">⚽ {mMod.a}–{mMod.b} <span style={{ color: `${acc}99` }}>{mMod.pct.toFixed(0)}%</span></span>
                            <span style={{ color: bl }} title="Mediana pela margem">med {mMed.a}–{mMed.b} <span style={{ color: `${bl}99` }}>{mMed.pct.toFixed(0)}%</span></span>
                            <span style={{ color: `${bd}` }}>|</span>
                            <span style={{ color: gn }}>{pr.pH.toFixed(0)}%</span>
                            <span style={{ color: dm }}>E {pr.pD.toFixed(0)}%</span>
                            <span style={{ color: bl }}>{pr.pA.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 1fr', alignItems: 'center', gap: '4px' }}>
                          <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 500 }}>{fl(m.home)} {nm(m.home)}</div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                            <input type="number" min="0" max="20" value={fx?.gA ?? ''} placeholder="-"
                              onChange={e => { const v = e.target.value; setUserRes(p => ({ ...p, [m.idx]: { ...p[m.idx], gA: v === '' ? undefined : +v } })); }}
                              style={{ width: '32px', padding: '3px', textAlign: 'center', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '13px', fontWeight: 700 }} />
                            <span style={{ color: dm }}>×</span>
                            <input type="number" min="0" max="20" value={fx?.gB ?? ''} placeholder="-"
                              onChange={e => { const v = e.target.value; setUserRes(p => ({ ...p, [m.idx]: { ...p[m.idx], gB: v === '' ? undefined : +v } })); }}
                              style={{ width: '32px', padding: '3px', textAlign: 'center', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '4px', fontSize: '13px', fontWeight: 700 }} />
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 500 }}>{fl(m.away)} {nm(m.away)}</div>
                        </div>
                        {hasFx && (() => {
                          const s = surpriseOf(_eH, _eA, m.home, m.away, fx.gA, fx.gB);
                          const qi = qualImpact(String(m.idx));
                          const open = clsOpen === m.idx;
                          return (
                            <>
                              <div style={{ marginTop: '3px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexWrap: 'wrap' }}>
                                <span title="Surpresa em bits (−log₂ da prob. pré-jogo). Placar = aquele placar exato; Resultado = o desfecho 1X2 (quem venceu/empatou, a 'zebra').">🎯 surpresa — <span style={{ color: s.bitsExact > 6 ? rd : s.bitsExact > 4.5 ? '#f97316' : acc, fontWeight: 700 }}>placar {s.bitsExact.toFixed(1)} bits</span> <span style={{ color: dm }}>({(s.pExact * 100).toFixed(1)}%)</span> · <span style={{ color: s.bitsOut > 6 ? rd : s.bitsOut > 4.5 ? '#f97316' : bl, fontWeight: 700 }}>resultado {s.bitsOut.toFixed(1)} bits</span> <span style={{ color: dm }}>({(s.pOut * 100).toFixed(0)}%)</span></span>
                                {qi && <span onClick={() => setClsOpen(open ? null : m.idx)} title="Clique para ver a expectativa de classificação dos times do grupo antes → depois deste resultado" style={{ color: Math.abs(qi.headline.dAdv) > 15 ? rd : Math.abs(qi.headline.dAdv) > 5 ? '#f97316' : dm, cursor: 'pointer', borderBottom: `1px dotted ${dm}` }}>⚡ classif.: {nm(qi.headline.t)} {qi.headline.dAdv > 0 ? '+' : ''}{qi.headline.dAdv.toFixed(1)} p.p. {open ? '▴' : '▾'}</span>}
                              </div>
                              {open && qi && classTable(m.idx, fx.gA, fx.gB, [m.home, m.away])}
                            </>
                          );
                        })()}
                        {!hasFx && (() => {
                          const open = preOpen === m.idx;
                          return (
                            <div style={{ marginTop: '3px', textAlign: 'center' }}>
                              <span onClick={() => setPreOpen(open ? null : m.idx)} title="Antes do jogo: quanto cada desfecho (vitória/empate) mudaria a classificação dos dois times" style={{ fontSize: '9px', color: dm, cursor: 'pointer', borderBottom: `1px dotted ${dm}` }}>🔮 impacto potencial de cada desfecho {open ? '▴' : '▾'}</span>
                              {open && preGamePreview(m.idx, m.home, m.away)}
                            </div>
                          );
                        })()}
                        {isLive && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', background: '#0d111d', borderRadius: '4px', border: `1px solid ${acc}33` }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: acc, marginBottom: '6px' }}>⏱️ Probabilidade ao vivo</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto auto', gap: '6px', alignItems: 'center', fontSize: '10px', marginBottom: '4px' }}>
                              <span style={{ color: dm }}>Min:</span>
                              <input type="range" min="0" max={90 + liS1 + liS2} value={liTau} onChange={e => setLI('tau', +e.target.value)} style={{ width: '100%' }} />
                              <span style={{ fontWeight: 700, color: acc, minWidth: '40px', textAlign: 'right' }}>{fmtClock(liTau, liS1)}{hasEv && <span style={{ color: tx, fontWeight: 600 }}> {liSt.gA}×{liSt.gB}</span>}</span>
                              <button onClick={() => setLI('tau', 0)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>0'</button>
                              <button onClick={() => setLI('tau', 45 + liS1)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>HT</button>
                              <button onClick={() => setLI('tau', 90 + liS1)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }} title="90' — começam os acréscimos do 2º tempo">FT</button>
                              <button onClick={() => setLI('tau', 90 + liS1 + liS2)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }} title="Fim do jogo (90' + acréscimos)">Fim</button>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '9px', color: dm, marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span>Acréscimos:</span>
                              <span>1ºT +</span>
                              <input type="number" min="0" max="15" value={li.s1} onChange={e => setLI('s1', e.target.value === '' ? 0 : +e.target.value)} style={{ width: '30px', padding: '1px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '10px' }} />
                              <span>2ºT +</span>
                              <input type="number" min="0" max="15" value={li.s2} onChange={e => setLI('s2', e.target.value === '' ? 0 : +e.target.value)} style={{ width: '30px', padding: '1px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '10px' }} />
                              <span style={{ marginLeft: 'auto' }}>jogo total: {90 + liS1 + liS2}'</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '9px', color: dm, marginBottom: '3px', textAlign: 'center' }}>{fl(m.home)} {nm(m.home)}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '9px' }}>
                                  <span style={{ color: dm }}>Gols:</span>
                                  <input type="number" min="0" max="20" value={hasEv ? liSt.gA : li.gA} disabled={hasEv} title={hasEv ? 'derivado dos eventos com minuto' : undefined} onChange={e => setLI('gA', +e.target.value || 0)} style={{ width: '36px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700, opacity: hasEv ? 0.55 : 1 }} />
                                  <span style={{ color: dm, marginLeft: '4px' }}>🟥</span>
                                  <input type="number" min="0" max="3" value={hasEv ? liSt.redsA : li.redsA} disabled={hasEv} title={hasEv ? 'derivado dos eventos com minuto' : undefined} onChange={e => setLI('redsA', +e.target.value || 0)} style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', opacity: hasEv ? 0.55 : 1 }} />
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '9px', color: dm, marginBottom: '3px', textAlign: 'center' }}>{fl(m.away)} {nm(m.away)}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '9px' }}>
                                  <span style={{ color: dm }}>Gols:</span>
                                  <input type="number" min="0" max="20" value={hasEv ? liSt.gB : li.gB} disabled={hasEv} title={hasEv ? 'derivado dos eventos com minuto' : undefined} onChange={e => setLI('gB', +e.target.value || 0)} style={{ width: '36px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700, opacity: hasEv ? 0.55 : 1 }} />
                                  <span style={{ color: dm, marginLeft: '4px' }}>🟥</span>
                                  <input type="number" min="0" max="3" value={hasEv ? liSt.redsB : li.redsB} disabled={hasEv} title={hasEv ? 'derivado dos eventos com minuto' : undefined} onChange={e => setLI('redsB', +e.target.value || 0)} style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', opacity: hasEv ? 0.55 : 1 }} />
                                </div>
                              </div>
                            </div>
                            {/* Eventos minutados → gráfico de evolução */}
                            <div style={{ marginBottom: '8px', padding: '6px 8px', background: card, borderRadius: '3px', border: `1px solid ${bd}` }}>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '9px', color: dm, flexWrap: 'wrap' }}>
                                <span title="Eventos com minuto alimentam o gráfico de evolução; o placar/vermelhos em cada minuto deriva deles (não altera o placar final do card)">Eventos:</span>
                                {[['g', '⚽ Gol'], ['r', '🟥 Verm.']].map(([v, l]) => (
                                  <button key={v} onClick={() => setEvForm(f => ({ ...f, t: v }))} style={{ padding: '1px 6px', fontSize: '9px', background: evForm.t === v ? `${acc}33` : 'transparent', color: evForm.t === v ? acc : dm, border: `1px solid ${evForm.t === v ? acc : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{l}</button>
                                ))}
                                {[['A', nm(m.home).slice(0, 8)], ['B', nm(m.away).slice(0, 8)]].map(([v, l]) => (
                                  <button key={v} onClick={() => setEvForm(f => ({ ...f, s: v }))} style={{ padding: '1px 6px', fontSize: '9px', background: evForm.s === v ? `${(v === 'A' ? gn : bl)}33` : 'transparent', color: evForm.s === v ? (v === 'A' ? gn : bl) : dm, border: `1px solid ${evForm.s === v ? (v === 'A' ? gn : bl) : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{l}</button>
                                ))}
                                <span>aos</span>
                                <input type="number" inputMode="numeric" min="0" max={90 + liS2} placeholder="min" title="Minuto do relógio do jogo, como na transmissão (ex.: 23, 60; 93 = 90+3)" value={evForm.m} onChange={e => setEvForm(f => ({ ...f, m: e.target.value }))} style={{ width: '40px', padding: '2px', textAlign: 'center', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '10px' }} />
                                <button disabled={evForm.m === '' || isNaN(+evForm.m)} onClick={() => {
                                  // minuto digitado = relógio do jogo (como na transmissão) → τ absoluto: depois dos 45' soma o acréscimo do 1ºT
                                  const gm2 = +evForm.m;
                                  const mm = Math.max(0, Math.min(90 + liS1 + liS2, gm2 <= 45 ? gm2 : gm2 + liS1));
                                  setLI('ev', [...li.ev, { m: mm, t: evForm.t, s: evForm.s }].sort((x, y) => x.m - y.m));
                                  setEvForm(f => ({ ...f, m: '' }));
                                }} style={{ padding: '1px 8px', fontSize: '10px', fontWeight: 700, background: evForm.m === '' ? 'transparent' : `${acc}33`, color: evForm.m === '' ? dm : acc, border: `1px solid ${evForm.m === '' ? bd : acc}`, borderRadius: '3px', cursor: evForm.m === '' ? 'default' : 'pointer' }}>+</button>
                              </div>
                              {hasEv && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                                  {li.ev.map((e2, i) => (
                                    <span key={i} style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', padding: '1px 6px', fontSize: '9px', borderRadius: '3px', background: `${e2.s === 'A' ? gn : bl}18`, border: `1px solid ${e2.s === 'A' ? gn : bl}44`, color: tx }}>
                                      {e2.t === 'g' ? '⚽' : '🟥'} {fmtClock(e2.m, liS1)} {nm(e2.s === 'A' ? m.home : m.away).slice(0, 3).toUpperCase()}
                                      <span onClick={() => setLI('ev', li.ev.filter((_, j) => j !== i))} style={{ color: rd, cursor: 'pointer', fontWeight: 700 }}>✕</span>
                                    </span>
                                  ))}
                                  <span onClick={() => setLI('ev', [])} style={{ fontSize: '8px', color: dm, cursor: 'pointer', alignSelf: 'center', textDecoration: 'underline' }}>limpar</span>
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', fontSize: '10px', marginBottom: '6px' }}>
                              <div style={{ background: `${gn}22`, padding: '4px', borderRadius: '3px', textAlign: 'center', border: `1px solid ${gn}44` }}>
                                <div style={{ fontSize: '8px', color: dm }}>V {nm(m.home).slice(0,8)}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: gn }}>{liveP.pH.toFixed(1)}%</div>
                              </div>
                              <div style={{ background: `${dm}22`, padding: '4px', borderRadius: '3px', textAlign: 'center', border: `1px solid ${bd}` }}>
                                <div style={{ fontSize: '8px', color: dm }}>Empate</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: tx }}>{liveP.pD.toFixed(1)}%</div>
                              </div>
                              <div style={{ background: `${bl}22`, padding: '4px', borderRadius: '3px', textAlign: 'center', border: `1px solid ${bl}44` }}>
                                <div style={{ fontSize: '8px', color: dm }}>V {nm(m.away).slice(0,8)}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: bl }}>{liveP.pA.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <div style={{ fontSize: '8px', color: dm, marginBottom: '3px' }}>Placares finais mais prováveis</div>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {liveP.scores.slice(0, 6).map(s => (
                                  <span key={s.a + '-' + s.b} style={{ padding: '2px 7px', fontSize: '10px', borderRadius: '3px', background: `${acc}18`, border: `1px solid ${acc}33`, color: tx, fontWeight: 600 }}>{s.a}–{s.b} <span style={{ color: acc }}>{(s.p * 100).toFixed(1)}%</span></span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '5px', fontSize: '9px', color: dm, flexWrap: 'wrap' }}>
                                <span>Placar de interesse:</span>
                                <input type="number" min="0" max="20" value={li.csA} onChange={e => setLI('csA', e.target.value)} placeholder="-" style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700 }} />
                                <span>×</span>
                                <input type="number" min="0" max="20" value={li.csB} onChange={e => setLI('csB', e.target.value)} placeholder="-" style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700 }} />
                                {li.csA !== '' && li.csB !== '' && (() => {
                                  const sa = +li.csA, sb = +li.csB;
                                  if (sa < liSt.gA || sb < liSt.gB) return <span style={{ color: rd }}>impossível (abaixo do placar atual)</span>;
                                  const pcs = liveP.pOf(sa, sb) * 100;
                                  return <span>→ <strong style={{ color: acc, fontSize: '11px' }}>{pcs >= 0.01 ? pcs.toFixed(2) : '<0.01'}%</strong> de terminar {sa}–{sb}</span>;
                                })()}
                              </div>
                            </div>
                            {/* Gráfico da evolução de P(V/E/D) ao longo do jogo */}
                            {liveChart && (() => {
                              const W = 800, H = 240, PAD = { l: 38, r: 14, t: 14, b: 26 };
                              const total = 90 + liS1 + liS2;
                              const xS = t2 => PAD.l + (t2 / total) * (W - PAD.l - PAD.r);
                              const yS = p2 => PAD.t + (1 - p2 / 100) * (H - PAD.t - PAD.b);
                              const hasT = liveChart[0].pT != null;
                              const mkPath = key => liveChart.map((p2, i) => (i === 0 ? 'M' : 'L') + xS(p2.tau).toFixed(1) + ',' + yS(p2[key]).toFixed(1)).join(' ');
                              const last = liveChart[liveChart.length - 1];
                              const series = [['pH', gn, 'V ' + nm(m.home).slice(0, 3).toUpperCase()], ['pD', dm, 'E'], ['pA', bl, 'V ' + nm(m.away).slice(0, 3).toUpperCase()], ...(hasT ? [['pT', acc, `P(${+li.csA}–${+li.csB})`]] : [])];
                              const hov = chartHover != null ? liveChart.reduce((best, p2) => Math.abs(p2.tau - chartHover) < Math.abs(best.tau - chartHover) ? p2 : best) : null;
                              const tipX = hov ? Math.min(xS(hov.tau) + 8, W - 118) : 0;
                              return (
                                <div style={{ marginBottom: '6px' }}>
                                  <div style={{ fontSize: '8px', color: dm, marginBottom: '2px' }}>Evolução da probabilidade durante o jogo {hasEv ? '(com os eventos informados)' : '(se o placar/vermelhos atuais se mantiverem)'} — passe o mouse para ver minuto a minuto</div>
                                  <svg viewBox={`0 0 ${W} ${H}`}
                                    onMouseMove={e2 => { const r2 = e2.currentTarget.getBoundingClientRect(); const t3 = Math.round(Math.max(0, Math.min(total, ((e2.clientX - r2.left) / r2.width * W - PAD.l) / (W - PAD.l - PAD.r) * total))); if (t3 !== chartHover) setChartHover(t3); }}
                                    onMouseLeave={() => setChartHover(null)}
                                    style={{ width: '100%', height: 'auto', display: 'block', background: card, borderRadius: '4px', border: `1px solid ${bd}`, cursor: 'crosshair' }}>
                                    {[0, 25, 50, 75, 100].map(g => (
                                      <g key={g}>
                                        <line x1={PAD.l} x2={W - PAD.r} y1={yS(g)} y2={yS(g)} stroke={bd} strokeWidth="0.5" />
                                        <text x={PAD.l - 5} y={yS(g) + 3} fontSize="9" fill={dm} textAnchor="end">{g}%</text>
                                      </g>
                                    ))}
                                    {[[0, "0'"], [45, "45'"], [90 + liS1, "90'"], [total, 'Fim']].map(([t2, l2]) => (
                                      <text key={l2} x={xS(Math.min(t2, total))} y={H - PAD.b + 13} fontSize="9" fill={dm} textAnchor="middle">{l2}</text>
                                    ))}
                                    <line x1={xS(liTau)} x2={xS(liTau)} y1={PAD.t} y2={H - PAD.b} stroke={acc} strokeWidth="1" strokeDasharray="3,3" />
                                    {series.map(([k, c]) => <path key={k} d={mkPath(k)} stroke={c} strokeWidth={k === 'pT' ? 1.5 : 2} strokeDasharray={k === 'pT' ? '5,3' : undefined} fill="none" />)}
                                    {series.map(([k, c], i) => <text key={k} x={W - PAD.r + 2 - 36} y={yS(last[k]) + (i === 1 ? 10 : 3)} fontSize="10" fill={c} fontWeight="700" textAnchor="start">{last[k].toFixed(0)}%</text>)}
                                    {li.ev.filter(e2 => e2.m <= total).map((e2, i) => (
                                      <text key={i} x={xS(e2.m)} y={H - PAD.b - 3} fontSize="11" textAnchor="middle" style={{ userSelect: 'none' }}>{e2.t === 'g' ? '⚽' : '🟥'}</text>
                                    ))}
                                    {series.map(([k, c, l2], i) => (
                                      <g key={'lg' + k}>
                                        <rect x={PAD.l + 6 + i * 92} y={PAD.t} width="10" height="3" fill={c} />
                                        <text x={PAD.l + 19 + i * 92} y={PAD.t + 4} fontSize="9" fill={c}>{l2}</text>
                                      </g>
                                    ))}
                                    {hov && (
                                      <g pointerEvents="none">
                                        <line x1={xS(hov.tau)} x2={xS(hov.tau)} y1={PAD.t} y2={H - PAD.b} stroke={tx} strokeWidth="0.8" />
                                        {series.map(([k, c]) => <circle key={'h' + k} cx={xS(hov.tau)} cy={yS(hov[k])} r="3" fill={c} />)}
                                        <rect x={tipX} y={PAD.t + 8} width="110" height={14 + series.length * 12} rx="4" fill="#0a0e18" stroke={bd} opacity="0.95" />
                                        <text x={tipX + 8} y={PAD.t + 21} fontSize="10" fill={acc} fontWeight="700">{fmtClock(hov.tau, liS1)}</text>
                                        {series.map(([k, c, l2], i) => (
                                          <text key={'tt' + k} x={tipX + 8} y={PAD.t + 33 + i * 12} fontSize="9" fill={c}>{l2}: {hov[k].toFixed(1)}%</text>
                                        ))}
                                      </g>
                                    )}
                                  </svg>
                                </div>
                              );
                            })()}
                            <div style={{ fontSize: '9px', color: dm, textAlign: 'center' }}>Placar final esperado: <strong style={{ color: tx }}>{liveP.expScoreA.toFixed(1)} - {liveP.expScoreB.toFixed(1)}</strong> • λ restante: {liveP.laR.toFixed(2)}/{liveP.lbR.toFixed(2)} gols</div>
                            {/* Como o placar atual move a expectativa de classificação dos times do grupo */}
                            {classTable(m.idx, liSt.gA, liSt.gB, [m.home, m.away])}
                            <div style={{ fontSize: '8px', color: dm, marginTop: '4px', textAlign: 'center', fontStyle: 'italic' }}>Modelo: a intensidade de gols cresce ao longo do jogo (~{Math.round(LIVE_F2 * 100)}% dos gols no 2º tempo) e os acréscimos jogam com a intensidade do fim de cada tempo; o total esperado da partida é preservado. Cada vermelho: 0.78× ao infrator, 1.12× ao adversário.</div>
                          </div>
                        )}
                        {isLive && (
                          <div style={{ marginTop: '6px', padding: '8px 10px', background: '#0d111d', borderRadius: '4px', border: `1px solid ${rd}33` }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: rd, marginBottom: '2px' }}>🤕 Lesões (somente neste jogo)</div>
                            <div style={{ fontSize: '8px', color: dm, marginBottom: '6px' }}>Cada lesão de titular importante reduz o Elo do time em {INJ_ELO} pts <strong>apenas nesta partida</strong> (não afeta os outros jogos do time).</div>
                            {[['h', m.home], ['a', m.away]].map(([side, team]) => { const n = (injuries[m.idx] || {})[side] || 0; return (
                              <div key={side} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ fontSize: '11px' }}>{fl(team)} {nm(team)} {n > 0 && <span style={{ color: rd, fontSize: '9px' }}>−{n * INJ_ELO} Elo</span>}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <button onClick={() => setInj(m.idx, side, -1)} style={{ width: '22px', height: '22px', fontSize: '13px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>−</button>
                                  <span style={{ minWidth: '34px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: n > 0 ? rd : dm }}>🤕 {n}</span>
                                  <button onClick={() => setInj(m.idx, side, 1)} style={{ width: '22px', height: '22px', fontSize: '13px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>+</button>
                                </div>
                              </div>
                            ); })}
                          </div>
                        )}
                        {isLive && h2hBox(m.home, m.away)}
                      </div>
                    );
                  })}
                </div>
              ); })];
            })()}
          </div>
        )}

        {/* SINGLE SIM */}
        {tab === 'single' && (
          !single ? <div style={{ padding: '60px', textAlign: 'center', color: dm }}>Clique em 🎲 Simular 1 Copa no topo</div> :
          <div style={cs}>
            {/* Champion */}
            <div style={{ textAlign: 'center', padding: '16px', marginBottom: '12px', background: `linear-gradient(135deg,${accD}44,${card})`, borderRadius: '10px', border: `2px solid ${gd}44` }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: gd }}>🏆 {fl(single.fin.winner)} {nm(single.fin.winner)}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '8px', fontSize: '11px' }}>
                <span>🥈 {fl(single.fin.winner === single.fin.home ? single.fin.away : single.fin.home)} {nm(single.fin.winner === single.fin.home ? single.fin.away : single.fin.home)}</span>
                <span>🥉 {fl(single.f3.winner)} {nm(single.f3.winner)}</span>
              </div>
            </div>



            {/* Phase filter */}
            <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {[['bracket', '🌳 Bracket'], ['groups', 'Grupos'], ['thirds', '3°s'], ['r32', 'R32'], ['r16', 'R16'], ['qfsf', 'QF→Final']].map(([id, l]) => (
                <SB key={id} active={phase === id} onClick={() => setPhase(id)}>{l}</SB>
              ))}
            </div>

            {/* Bracket tree */}
            {phase === 'bracket' && (() => {
              const s = single;
              const MB = ({m}) => {
                if (!m) return null;
                const Row = ({t, g, pos, w}) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 4px', background: w ? `${gd}15` : 'transparent', borderLeft: w ? `2px solid ${gd}` : '2px solid transparent' }}>
                    <span style={{ fontSize: '9px', fontWeight: w ? 700 : 400, color: w ? tx : dm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pos && <span style={{ fontSize: '7px', color: bl, marginRight: '2px' }}>{pos}</span>}{fl(t)}{nm(t)}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: w ? gd : dm, marginLeft: '4px' }}>{g}</span>
                  </div>
                );
                return (
                  <div style={{ background: '#0d111d', borderRadius: '3px', border: `1px solid ${bd}`, minWidth: '108px', maxWidth: '140px' }}>
                    <div style={{ fontSize: '7px', color: dm, padding: '0px 4px', borderBottom: `1px solid ${bd}33`, display: 'flex', justifyContent: 'space-between' }}>
                      <span>M{m.mn} {KO_BRT[m.mn]}</span><span>{m.city}</span>{m.pen ? <span style={{color:'#f97316'}}>PEN</span> : m.aet ? <span style={{color:bl}}>AET</span> : null}
                    </div>
                    <Row t={m.home} g={m.gA} pos={m.ph} w={m.winner===m.home}/>
                    <Row t={m.away} g={m.gB} pos={m.pa} w={m.winner===m.away}/>
                  </div>
                );
              };
              // Connector column: vertical line between two feeder matches
              const Col = ({children}) => <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2px' }}>{children}</div>;
              const Con = () => <div style={{ width: '8px', borderRight: `1px solid ${bd}`, minHeight: '100%', alignSelf: 'center' }}/>;

              // Half-bracket: 4 R32 → 2 R16 → 1 QF
              const HB = ({r32a, r32b, r32c, r32d, r16a, r16b, qf}) => (
                <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                  <Col>
                    <Col><MB m={s.r32[r32a]}/><MB m={s.r32[r32b]}/></Col>
                    <div style={{ height: '4px' }}/>
                    <Col><MB m={s.r32[r32c]}/><MB m={s.r32[r32d]}/></Col>
                  </Col>
                  <Con/>
                  <Col><MB m={s.r16[r16a]}/><div style={{ height: '20px' }}/><MB m={s.r16[r16b]}/></Col>
                  <Con/>
                  <Col><MB m={s.qf[qf]}/></Col>
                </div>
              );

              return (
                <div style={{ overflowX: 'auto' }}>
                  {/* Final on top */}
                  <div style={{ textAlign: 'center', margin: '0 0 16px', padding: '10px', background: `linear-gradient(135deg,${acc}22,${card})`, borderRadius: '8px', border: `2px solid ${gd}44`, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ fontSize: '8px', color: dm, marginBottom: '2px' }}>M{s.fin.mn} • {DOW(s.fin.date)} {s.fin.date} {KO_BRT[s.fin.mn]} BRT • {s.fin.city}{s.fin.pen ? ' PEN' : s.fin.aet ? ' AET' : ''}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: s.fin.winner === s.fin.home ? 800 : 400, color: s.fin.winner === s.fin.home ? gd : dm }}>
                        <span style={{ fontSize: '8px', color: bl }}>{s.fin.ph} </span>{fl(s.fin.home)} {nm(s.fin.home)}
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: gd }}>{s.fin.gA}–{s.fin.gB}{s.fin.pen ? <span style={{fontSize:'9px',color:'#f97316',marginLeft:'2px'}}>PEN</span> : s.fin.aet ? <span style={{fontSize:'9px',color:bl,marginLeft:'2px'}}>AET</span> : null}</span>
                      <span style={{ fontSize: '13px', fontWeight: s.fin.winner === s.fin.away ? 800 : 400, color: s.fin.winner === s.fin.away ? gd : dm }}>
                        {fl(s.fin.away)} {nm(s.fin.away)} <span style={{ fontSize: '8px', color: bl }}>{s.fin.pa}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pathway 1: SF between QFs */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: bl, marginBottom: '4px' }}>Pathway 1 → SF Dallas 14/Jul</div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', overflowX: 'auto', marginBottom: '16px' }}>
                    <Col>
                      <HB r32a={1} r32b={4} r32c={0} r32d={2} r16a={0} r16b={1} qf={0}/>
                      <div style={{ height: '6px' }}/>
                      <HB r32a={10} r32b={11} r32c={8} r32d={9} r16a={4} r16b={5} qf={1}/>
                    </Col>
                    <Con/>
                    <Col><MB m={s.sf[0]}/></Col>
                  </div>

                  {/* Pathway 2: SF between QFs */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: bl, marginBottom: '4px' }}>Pathway 2 → SF Atlanta 15/Jul</div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', overflowX: 'auto', marginBottom: '16px' }}>
                    <Col>
                      <HB r32a={6} r32b={7} r32c={3} r32d={5} r16a={3} r16b={2} qf={2}/>
                      <div style={{ height: '6px' }}/>
                      <HB r32a={12} r32b={14} r32c={13} r32d={15} r16a={7} r16b={6} qf={3}/>
                    </Col>
                    <Con/>
                    <Col><MB m={s.sf[1]}/></Col>
                  </div>

                  <div style={{ textAlign: 'center', margin: '6px 0', fontSize: '11px', color: dm }}>
                    🥉 {fl(s.f3.winner)} {nm(s.f3.winner)} {s.f3.gA}–{s.f3.gB}{s.f3.pen ? ' (PEN)' : s.f3.aet ? ' (AET)' : ''} {fl(s.f3.winner === s.f3.home ? s.f3.away : s.f3.home)} {nm(s.f3.winner === s.f3.home ? s.f3.away : s.f3.home)}
                  </div>
                </div>
              );
            })()}

            {/* Group standings */}
            {(phase === 'groups') && (
              <>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '0 0 6px' }}>Classificação</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: '6px', marginBottom: '12px' }}>
                  {Object.entries(single.st).map(([gn, { sorted, tb: tbl }]) => (
                    <div key={gn} style={crd}>
                      <div style={hdr}>Grupo {gn}</div>
                      {sorted.map((t, i) => {
                        const d = tbl[t]; const adv = i < 2 || single.b8.some(b => b.team === t);
                        return (
                          <div key={t} style={{ display: 'grid', gridTemplateColumns: '6px 20px 1fr repeat(3, 22px)', alignItems: 'center', padding: '2px 6px', background: adv ? '#22c55e08' : 'transparent', gap: '3px', fontSize: '10px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', display: 'inline-block', background: i < 2 ? '#22c55e' : adv ? '#3b82f6' : '#ef4444' }} />
                            <span>{fl(t)}</span>
                            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nm(t)}</span>
                            <span style={{ textAlign: 'center', fontWeight: 700 }}>{d.pts}</span>
                            <span style={{ textAlign: 'center', color: d.gd > 0 ? '#22c55e' : d.gd < 0 ? '#ef4444' : '#8b8d94' }}>{d.gd > 0 ? '+' : ''}{d.gd}</span>
                            <span style={{ textAlign: 'center', color: dm }}>{d.gf}:{d.ga}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Matches by date */}
                {(() => {
                  const byDate = {};
                  single.gm.forEach(m => { if (!byDate[m.date]) byDate[m.date] = []; byDate[m.date].push(m); });
                  return Object.entries(byDate).sort((a, b) => dateKey(a[0]) - dateKey(b[0])).map(([date, ms]) => {
                    ms.sort((a, b) => a.brt.localeCompare(b.brt));
                    return (
                    <div key={date} style={{ marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: gd, padding: '2px 0', borderBottom: `1px solid ${bd}33` }}>📆 {DOW(date)} {date}</div>
                      {ms.map((m, i) => {
                        const eloDiff = rt(m.home) - rt(m.away);
                        const upset = (m.gA > m.gB && eloDiff < -150) || (m.gB > m.gA && eloDiff > 150);
                        const bigUpset = (m.gA > m.gB && eloDiff < -300) || (m.gB > m.gA && eloDiff > 300);
                        return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 20px 8px 20px 1fr 90px', alignItems: 'center', padding: '2px 0', fontSize: '11px', borderLeft: bigUpset ? '2px solid #f97316' : upset ? `2px solid ${acc}` : `2px solid ${m.real ? gn : bd}`, paddingLeft: '6px', background: bigUpset ? '#f9731608' : 'transparent' }}>
                          <span style={{ fontSize: '9px', color: dm }}>{bigUpset ? '🦓' : upset ? '!' : `G${m.group}`}</span>
                          <span style={{ textAlign: 'right', fontWeight: m.gA > m.gB ? 600 : 400, color: m.gA > m.gB ? tx : dm }}>{fl(m.home)} {nm(m.home)}</span>
                          <span style={{ textAlign: 'center', fontWeight: 700, color: acc }}>{m.gA}</span>
                          <span style={{ textAlign: 'center', fontSize: '9px', color: dm }}>×</span>
                          <span style={{ textAlign: 'center', fontWeight: 700, color: acc }}>{m.gB}</span>
                          <span style={{ fontWeight: m.gB > m.gA ? 600 : 400, color: m.gB > m.gA ? tx : dm }}>{fl(m.away)} {nm(m.away)}</span>
                          <span style={{ fontSize: '8px', color: dm, textAlign: 'right' }}>{m.brt} • {m.city}</span>
                        </div>
                        );
                      })}
                    </div>
                    );
                  });
                })()}
              </>
            )}


            {phase === 'thirds' && single && (() => {
              const allThirds = single.thirds || [];
              return (
                <div style={{ marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: bl, margin: '0 0 6px' }}>Classificação dos 3°s colocados</h3>
                  <div style={{ display: 'grid', gap: '3px', maxWidth: '500px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 40px 32px 28px', gap: '4px', fontSize: '9px', color: dm, fontWeight: 600, padding: '2px 6px' }}>
                      <span>#</span><span>Time</span><span style={{ textAlign: 'right' }}>Pts</span><span style={{ textAlign: 'right' }}>SG</span><span style={{ textAlign: 'right' }}>GM</span>
                    </div>
                    {allThirds.map((t, i) => {
                      const adv = i < 8;
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 40px 32px 28px', gap: '4px', padding: '4px 6px', background: adv ? `${gn}08` : `${rd}08`, borderRadius: '3px', borderLeft: adv ? `2px solid ${gn}` : `2px solid ${rd}`, fontSize: '11px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', color: adv ? gn : rd, fontWeight: 700 }}>{i+1}</span>
                          <span style={{ fontWeight: adv ? 600 : 400, color: adv ? tx : dm }}>{fl(t.team)} {nm(t.team)} <span style={{ fontSize: '8px', color: bl }}>({t.group}3)</span></span>
                          <span style={{ textAlign: 'right', fontWeight: 600, color: adv ? acc : dm }}>{t.pts}</span>
                          <span style={{ textAlign: 'right', color: t.gd > 0 ? gn : t.gd < 0 ? rd : dm }}>{t.gd > 0 ? '+' : ''}{t.gd}</span>
                          <span style={{ textAlign: 'right', color: dm }}>{t.gf}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '10px', color: dm, marginTop: '8px' }}>Cruzamento Anexo C: {['A','B','D','E','G','I','K','L'].map(w => `1°${w}→3°${single.asgn?.[w]||'?'}`).join(' | ')}</div>
                </div>
              );
            })()}

            {/* Knockout rounds */}
            {(phase === 'r32') && (<>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '12px 0 6px' }}>🏟️ R32</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '4px' }}>
                {BRACKET_R32_ORDER.map(i => single.r32[i] && <KO key={i} m={single.r32[i]} sp />)}
              </div>
            </>)}
            {(phase === 'r16') && (<>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '12px 0 6px' }}>⚔️ R16</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '4px' }}>
                {BRACKET_R16_ORDER.map(i => single.r16[i] && <KO key={i} m={single.r16[i]} sp />)}
              </div>
            </>)}
            {(phase === 'qfsf') && (<>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '12px 0 6px' }}>🔥 Quartas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '4px' }}>
                {single.qf.map((m, i) => <KO key={i} m={m} sp />)}
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '12px 0 6px' }}>🌟 Semis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '4px' }}>
                {single.sf.map((m, i) => <KO key={i} m={m} sp />)}
              </div>
              <h3 style={{ fontSize: '12px', color: dm, margin: '12px 0 6px' }}>🥉 3° Lugar</h3>
              <div style={{ maxWidth: '360px' }}><KO m={single.f3} sp /></div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: gd, margin: '12px 0 6px' }}>🏆 FINAL • 19/Jul • MetLife</h3>
              <div style={{ maxWidth: '400px' }}><KO m={single.fin} sp /></div>
            </>)}
          </div>
        )}

        {/* EVOLUTION */}
        {tab === 'evolution' && (
          <div style={cs}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: acc }}>📈 Evolução das chances</div>
            <div style={{ fontSize: '10px', color: dm, marginBottom: '10px' }}>Como as probabilidades de cada seleção mudaram conforme os resultados foram saindo. Cada ponto = um snapshot (Monte Carlo recalculado após cada jogo com placar).</div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <SB active={evoView === 'chart'} onClick={() => setEvoView('chart')}>📈 Gráfico</SB>
              <SB active={evoView === 'models'} onClick={() => setEvoView('models')}>🔬 Comparar modelos</SB>
            </div>

            {evoView === 'chart' && (<>
            {/* Controls */}
            <div style={{ background: card, padding: '8px 10px', borderRadius: '5px', border: `1px solid ${bd}`, marginBottom: '10px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: dm, fontWeight: 600 }}>Métrica:</span>
                {[['ch', '🏆 Campeão'], ['fin', '🥇 Final'], ['sf', '🥈 Semi'], ['qf', '🥉 Quartas'], ['r16', 'R16'], ['r32', 'R32 (passar GS)']].map(([k, l]) => (
                  <button key={k} onClick={() => setEvoMetric(k)} style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 600, background: evoMetric === k ? `${acc}33` : 'transparent', color: evoMetric === k ? acc : dm, border: `1px solid ${evoMetric === k ? acc : bd}`, borderRadius: '3px', cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: dm, fontWeight: 600 }}>Times (até 6):</span>
                <select onChange={e => { const t = e.target.value; if (t && !evoTeams.includes(t) && evoTeams.length < 6) setEvoTeams([...evoTeams, t]); e.target.value = ''; }} style={{ padding: '3px 6px', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '10px' }}>
                  <option value="">+ adicionar...</option>
                  {Object.values(groups).flat().filter(t => !evoTeams.includes(t)).map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                </select>
                {evoTeams.map((t, i) => {
                  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4'];
                  return (
                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: colors[i] + '22', border: `1px solid ${colors[i]}66`, borderRadius: '3px', fontSize: '10px' }}>
                      <span style={{ width: '6px', height: '6px', background: colors[i], borderRadius: '50%' }}/>
                      <span style={{ color: tx }}>{fl(t)} {nm(t)}</span>
                      <button onClick={() => setEvoTeams(evoTeams.filter(x => x !== t))} style={{ marginLeft: '2px', background: 'transparent', border: 'none', color: dm, cursor: 'pointer', fontSize: '11px', padding: 0 }}>×</button>
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '8px' }}>
                <Tip text="Por padrão, gera um snapshot após cada jogo com resultado. Escolha um time para gerar snapshots apenas após os jogos desse time (gráfico mais limpo para a trajetória dele).">
                  <span style={{ fontSize: '10px', color: dm, fontWeight: 600 }}>Snapshots após jogos de:</span>
                </Tip>
                <select value={evoFilterTeam} onChange={e => setEvoFilterTeam(e.target.value)} style={{ padding: '3px 6px', background: '#0d111d', color: evoFilterTeam ? acc : tx, border: `1px solid ${evoFilterTeam ? acc : bd}`, borderRadius: '3px', fontSize: '10px', fontWeight: evoFilterTeam ? 600 : 400 }}>
                  <option value="">— Todos os jogos —</option>
                  {evoTeams.map(t => <option key={t} value={t}>{fl(t)} {nm(t)} (selecionado)</option>)}
                  <option disabled>──────────</option>
                  {Object.values(groups).flat().filter(t => !evoTeams.includes(t)).sort((a,b) => nm(a).localeCompare(nm(b))).map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                </select>
                {evoFilterTeam && <span style={{ fontSize: '9px', color: dm, fontStyle: 'italic' }}>(somente jogos com {nm(evoFilterTeam)})</span>}
              </div>
            </div>

            <button onClick={doEvolution} disabled={evoLoading || nFx === 0} style={{ padding: '8px 14px', fontSize: '11px', fontWeight: 700, background: nFx === 0 ? '#1a1a2a' : `${acc}33`, color: nFx === 0 ? dm : acc, border: `1px solid ${nFx === 0 ? bd : acc}`, borderRadius: '4px', cursor: nFx === 0 ? 'not-allowed' : 'pointer', marginBottom: '10px' }}>
              {evoLoading ? '⏳ Calculando snapshots...' : nFx === 0 ? '⚠ Preencha resultados primeiro' : `📊 Calcular evolução (${nFx} jogos preenchidos)`}
            </button>

            {evoData && evoData.snapshots.length > 1 && (() => {
              const W = 800, H = 360, PAD = { l: 50, r: 20, t: 20, b: 50 };
              const plotW = W - PAD.l - PAD.r, plotH = H - PAD.t - PAD.b;
              const xs = evoData.snapshots.map((_, i) => i);
              const maxIdx = xs.length - 1;
              const xScale = i => maxIdx === 0 ? PAD.l + plotW / 2 : PAD.l + (i / maxIdx) * plotW;
              const yScale = p => PAD.t + plotH - (p / 100) * plotH;
              const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4'];
              const gridYs = [0, 20, 40, 60, 80, 100];
              return (
                <div style={{ background: card, padding: '10px', borderRadius: '6px', border: `1px solid ${bd}`, overflowX: 'auto' }}>
                  <div style={{ fontSize: '10px', color: dm, marginBottom: '6px' }}>{evoData.nSim.toLocaleString()} sims por snapshot • {evoData.snapshots.length} pontos</div>
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: '420px', display: 'block' }}>
                    {gridYs.map(g => (
                      <g key={g}>
                        <line x1={PAD.l} x2={W - PAD.r} y1={yScale(g)} y2={yScale(g)} stroke={bd} strokeWidth="0.5" />
                        <text x={PAD.l - 6} y={yScale(g) + 3} fontSize="9" fill={dm} textAnchor="end">{g}%</text>
                      </g>
                    ))}
                    {xs.map(i => (i === 0 || i === maxIdx || i % Math.max(1, Math.ceil(maxIdx / 12)) === 0) && (
                      <text key={i} x={xScale(i)} y={H - PAD.b + 14} fontSize="8" fill={dm} textAnchor="middle" transform={`rotate(-30 ${xScale(i)} ${H - PAD.b + 14})`}>{evoData.snapshots[i].label}</text>
                    ))}
                    <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke={tx} strokeWidth="1" />
                    <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} stroke={tx} strokeWidth="1" />
                    {evoTeams.map((t, ti) => {
                      const pts = xs.map(i => ({ x: xScale(i), y: yScale(evoData.snapshots[i].probs[t]?.[evoMetric] ?? 0), v: evoData.snapshots[i].probs[t]?.[evoMetric] ?? 0 }));
                      const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x + ',' + p.y).join(' ');
                      return (
                        <g key={t}>
                          <path d={path} stroke={colors[ti]} strokeWidth="2" fill="none" />
                          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={colors[ti]} />)}
                          <text x={pts[pts.length - 1].x + 4} y={pts[pts.length - 1].y + 3} fontSize="9" fill={colors[ti]} fontWeight="700">{pts[pts.length - 1].v.toFixed(0)}%</text>
                        </g>
                      );
                    })}
                  </svg>
                  <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#0d111d' }}>
                          <th style={{ padding: '4px', textAlign: 'left', color: dm, fontWeight: 600 }}>Seleção</th>
                          {evoData.snapshots.map((s, i) => (i === 0 || i === evoData.snapshots.length - 1 || i % Math.max(1, Math.ceil(maxIdx / 8)) === 0) && (
                            <th key={i} style={{ padding: '4px', textAlign: 'right', color: dm, fontWeight: 600, fontSize: '9px' }}>{s.label}</th>
                          ))}
                          <th style={{ padding: '4px', textAlign: 'right', color: acc, fontWeight: 700 }}>Δ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evoTeams.map((t, ti) => {
                          const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4'];
                          const first = evoData.snapshots[0].probs[t]?.[evoMetric] ?? 0;
                          const last = evoData.snapshots[evoData.snapshots.length - 1].probs[t]?.[evoMetric] ?? 0;
                          const delta = last - first;
                          return (
                            <tr key={t} style={{ borderBottom: `1px solid ${bd}33` }}>
                              <td style={{ padding: '4px' }}><span style={{ display: 'inline-block', width: '6px', height: '6px', background: colors[ti], borderRadius: '50%', marginRight: '4px' }}/>{fl(t)} {nm(t)}</td>
                              {evoData.snapshots.map((s, i) => (i === 0 || i === evoData.snapshots.length - 1 || i % Math.max(1, Math.ceil(maxIdx / 8)) === 0) && (
                                <td key={i} style={{ padding: '4px', textAlign: 'right', color: tx }}>{(s.probs[t]?.[evoMetric] ?? 0).toFixed(1)}</td>
                              ))}
                              <td style={{ padding: '4px', textAlign: 'right', fontWeight: 700, color: delta > 1 ? gn : delta < -1 ? rd : dm }}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {evoData && evoData.snapshots.length <= 1 && (
              <div style={{ padding: '20px', textAlign: 'center', color: dm, fontSize: '11px' }}>Apenas 1 snapshot disponível. Preencha mais resultados para ver evolução.</div>
            )}
            {!evoData && !evoLoading && (
              <div style={{ padding: '20px', textAlign: 'center', color: dm, fontSize: '11px' }}>Preencha resultados na aba 📝 Resultados e clique em "Calcular evolução" para ver como as chances mudam.</div>
            )}
            </>)}

            {evoView === 'models' && renderModelBacktest()}
          </div>
        )}

        {/* INFO */}
        {tab === 'info' && (
          <div style={{ ...cs, maxWidth: '700px' }}>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: gd, margin: '0 0 10px', fontSize: '15px' }}>Como usar o simulador</h3>
              <p style={{ color: tx }}><strong style={{ color: acc }}>a) Simule milhares de Copas.</strong> Rode 1.000 a 100.000 simulações Monte Carlo usando diferentes sistemas de rating (Elo, FIFA Ranking, Odds implícitas ou valores customizados). Ajuste o fator de gols esperados para calibrar o modelo.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>b) Explore cruzamentos.</strong> Com base nas simulações, descubra quais times, posições e jogos se cruzam em cada fase. Filtre por posição no grupo para ver cenários condicionais — ex: "se o Brasil terminar em 2° no grupo, quem ele enfrenta nas oitavas?"</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>c) Identifique os jogos mais interessantes.</strong> A aba Elo Jogos ranqueia todos os 104 jogos por qualidade (Elo), importância para o título (Champion Stake e Title Shift) e equilíbrio. Um score composto de Interesse destaca os top 10 jogos da fase de grupos.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>d) Acompanhe a Copa em tempo real.</strong> Preencha resultados reais na aba Resultados e force classificações nos grupos. Rode a simulação novamente e veja como as probabilidades evoluem jogo a jogo. Cada resultado atualiza o bracket, as chances de título e os cruzamentos.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>e) Probabilidade ao vivo (intra-jogo).</strong> Na aba 📝 Resultados, clique em qualquer card de jogo para expandir e calcular as chances V/E/D e os placares finais mais prováveis considerando o minuto atual (incluindo acréscimos de cada tempo, configuráveis), o placar parcial e cartões vermelhos. Modelo: a intensidade de gols cresce linearmente ao longo do jogo (~56% dos gols no 2º tempo regulamentar) e os acréscimos jogam com a intensidade do fim do tempo correspondente — o total esperado da partida é preservado; cada vermelho aplica 0.78× ao infrator e 1.12× ao adversário sobre o λ (Poisson).</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>f) Aba 📈 Evolução.</strong> Após preencher alguns resultados, vá em 📈 Evolução, escolha métrica (campeão/semi/QF/R16/passar de grupo) e até 6 seleções, e clique em "Calcular evolução". O simulador roda um MC após cada jogo preenchido e mostra como as chances de cada time mudaram ao longo da Copa.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>g) Resultados fixos no código.</strong> Para resultados já oficiais, edite a constante <code style={{ color: bl, fontSize: '9px' }}>BUILT_IN_RESULTS</code> no topo do arquivo. Formato: <code style={{ color: bl, fontSize: '9px' }}>{'{1:{gA:1,gB:0}, 2:{gA:2,gB:1}, "k73":{gA:1,gB:1,pw:"B"}}'}</code>. Chaves numéricas (1-72) = fase de grupos; chaves <code style={{ color: bl, fontSize: '9px' }}>'kNN'</code> = mata-mata (73-104). <code style={{ color: bl, fontSize: '9px' }}>pw</code> opcional = vencedor pênaltis ('A' ou 'B').</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>e) Simule uma Copa específica.</strong> Use "Simular 1 Copa" para gerar um torneio completo com bracket, placares e campeão — um destino possível entre milhares.</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: acc, margin: '0 0 10px', fontSize: '14px' }}>Critérios da Simulação</h3>
              <p><strong style={{ color: tx }}>Modelo de gols:</strong> Cada jogo é simulado como duas distribuições de Poisson independentes, uma para os gols de cada time. A taxa esperada (λ) sai da diferença de Elo: primeiro a expectativa de resultado do Elo <code style={{ color: bl, fontSize: '9px' }}>e = 1/(1+10^(−Δ/400))</code> (Δ = rating do favorito − rating do azarão); depois <code style={{ color: bl, fontSize: '9px' }}>λ_fav = me·(c0 + c1·e)</code> e <code style={{ color: bl, fontSize: '9px' }}>λ_aza = me·(c0 + c1·(1−e))</code>, com <code style={{ color: bl, fontSize: '9px' }}>c1 = 2·(1−c0)</code>. Essa restrição faz o total de gols ser sempre <strong>2·me</strong> (o fator "gols/jogo" da aba Times, padrão 2.6) e um jogo equilibrado (e=0.5) dar exatamente <strong>me</strong> gols para cada lado. Ou seja, <strong>c0</strong> controla só o quão acentuado é o favoritismo — sem mexer no placar de jogos parelhos nem no total de gols.</p>
              <p><strong style={{ color: tx }}>Calibração do favoritismo (c0 dependente do Elo):</strong> O peso c0 não é fixo: ele cai conforme o desnível cresce, via uma logística — <code style={{ color: bl, fontSize: '9px' }}>c0 = 0.50 − 0.40/(1 + e^(−(|Δ|−190)/70))</code> — ficando em ~0.50 nos jogos equilibrados e descendo até ~0.10 nos grandes desníveis. Isso veio de um backtest contra ~3.000 jogos internacionais reais (2016–2026): com c0 fixo em 0.55, o modelo era <strong>conservador demais</strong> para favoritos fortes — no maior desnível típico de Copa, o favorito vence ~82% na realidade mas o modelo dava ~61%. Como a curva real só descola do modelo antigo em desníveis grandes, a correção é concentrada lá (centro em Δ≈190), deixando os jogos equilibrados intactos. O erro médio de P(vitória) vs. a realidade caiu de ~7,7 para ~2,1 pontos percentuais. Há um slider <strong>Favoritismo</strong> na aba Times (0 a 1): <strong>1</strong> = calibrado (padrão), <strong>0</strong> = volta exatamente ao modelo anterior (c0 = 0.55 fixo). Ele não afeta jogos equilibrados.</p>
              <p><strong style={{ color: tx }}>Vantagem de mandante:</strong> +{homeAdv} pontos de rating aplicados quando EUA, México ou Canadá jogam em cidade do seu próprio país. Mapeamento de 17 sedes para o país correspondente. Times que jogam fora do seu país não recebem bônus, mesmo como mandantes no papel.</p>
              <p><strong style={{ color: tx }}>Fase de grupos:</strong> Cada jogo simulado via Poisson. Classificação por pontos, saldo de gols, gols marcados e sorteio. Os 2 primeiros de cada grupo avançam. Os 8 melhores 3°s avançam via Anexo C da FIFA (495 combinações pré-codificadas).</p>
              <p><strong style={{ color: tx }}>Mata-mata (90min):</strong> Simulado via Poisson com os mesmos parâmetros. Em caso de empate, prorrogação simulada com λ reduzido a 33% (~30min). Se ainda empatado, pênaltis com probabilidade base 50/50 + pequeno ajuste por diferença de rating (Δ/4000).</p>
              <p><strong style={{ color: tx }}>Seleção dos 8 melhores 3°s:</strong> Em cada simulação, os 12 terceiros colocados são ranqueados por pontos, saldo e gols. Os 8 melhores avançam e são alocados nos R32 conforme a combinação correspondente do Anexo C da FIFA — que determina qual 3° enfrenta qual 1° de grupo.</p>
              <p><strong style={{ color: tx }}>Bracket probabilístico:</strong> Na aba Probs/Bracket, o time mais provável de cada posição é atribuído via greedy dedup (cada time aparece uma vez). O mata-mata é traçado com base nos dados do Monte Carlo — o time com maior probabilidade de avançar é selecionado.</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: acc, margin: '0 0 10px', fontSize: '14px' }}>Sensibilidade Elo → Probabilidade</h3>
              <p style={{ marginBottom: '8px' }}>A tabela mostra como a diferença de Elo entre dois times afeta as probabilidades de vitória, empate e derrota no modelo Poisson, <strong>já com a recalibração de favoritismo</strong> (fase de grupos, sem vantagem de mando). Note como, com o c0 dependente do Elo, a vitória do favorito sobe mais rápido em desníveis grandes do que subia antes.</p>
              <table style={{ width: '100%', maxWidth: '500px', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead><tr>
                  {['ΔElo', 'Vitória (%)', 'Empate (%)', 'Derrota (%)', 'Gols Fav', 'Gols Con'].map(h => (
                    <th key={h} style={{ padding: '4px 6px', textAlign: 'right', color: dm, fontWeight: 600, borderBottom: `1px solid ${bd}`, fontSize: '9px' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[0, 50, 100, 150, 200, 250, 300, 400, 500, 600, 750].map(delta => {
                    const { la, lb } = cL(1600 + delta, 1600);
                    const pr = mProbs(1600 + delta, 1600);
                    return (
                      <tr key={delta} style={{ borderBottom: `1px solid ${bd}22` }}>
                        <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, color: acc }}>{delta === 0 ? '0 (=)' : '+' + delta}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{pr.pH.toFixed(1)}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: bl }}>{pr.pD.toFixed(1)}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: '#ef4444' }}>{pr.pA.toFixed(1)}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: dm }}>{la.toFixed(2)}</td>
                        <td style={{ padding: '3px 6px', textAlign: 'right', color: dm }}>{lb.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: '9px', marginTop: '6px' }}>ΔElo = diferença favorável. Máximo do torneio: Espanha (2155) vs Qatar (1423) = Δ732. Gols Fav/Con = λ esperados por time (Poisson). Com gols/jogo = {(_ME * 2).toFixed(1)}.{useTilt ? ' • Tilt ON: gols totais por jogo são deslocados pela soma dos tilts dos dois times (rangem aprox. de –0.8 a +1.0).' : ''}</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm }}>
              <h3 style={{ color: acc, margin: '0 0 8px', fontSize: '14px' }}>Modelo & Bracket</h3>
              <p><strong style={{ color: tx }}>Ratings:</strong> (1) FIFA Ranking 1/Abr/2026, (2) Elo eloratings.net 4/Jun/2026, (3) Apostas — Elo implícito, (4) <strong style={{ color: acc }}>PELE — Silver Bulletin Mai/2026</strong> (qualidade ofensiva/defensiva agregada, escala calibrada similar ao Elo), (5) Custom — edite manualmente na aba Times. Vantagem de +{homeAdv}pts (ajustável na aba Times) aplicada quando EUA/México/Canadá jogam em seu próprio país.</p>
              <p><strong style={{ color: tx }}>Os dois "tilts" (ambos mexem no total de gols da partida):</strong> O total de gols esperado de um jogo (la+lb) sai de <code style={{ color: bl, fontSize: '9px' }}>2·me</code>, e dois fatores independentes ajustam o <code style={{ color: bl, fontSize: '9px' }}>me</code> por motivos diferentes — um pelo <em>estilo</em> dos times, outro pelo <em>desnível</em> entre eles.</p>
              <p><strong style={{ color: tx }}>🎯 Tilt (estilo):</strong> Cada seleção tem um tilt (–.45 a +.57) que reflete se seus jogos costumam ter mais gols (atacante) ou menos (defensivo). O tilt da partida = <strong>soma</strong> dos dois times, somado ao total (Ger +.57 vs Mar –.45 → +.12 → ~+0.12 gols no total). É <strong>aditivo</strong>: <code style={{ color: bl, fontSize: '9px' }}>me = _ME + tilt_estilo·0.5</code>. Todas as 54 seleções têm tilt.</p>
              <p><strong style={{ color: tx }}>⚽ Goleada (desnível):</strong> Na realidade, quanto maior a diferença de Elo, mais gols o jogo tem — e quase todos do favorito (nos dados 2016–26: jogo equilibrado ~2,35 gols; grande desnível ~3,45, com o favorito indo de 1,2 a 3,1 e o azarão caindo de 1,1 a 0,3). Este tilt é <strong>multiplicativo</strong> sobre o total, via logística: <code style={{ color: bl, fontSize: '9px' }}>g(Δ) = 0.90 + 0.45/(1+e^(−(|Δ|−330)/80))</code> — ~0,91× em jogos equilibrados subindo a ~1,35× em grandes desníveis. Não afeta jogos parelhos.</p>
              <p><strong style={{ color: tx }}>Como se combinam:</strong> os dois multiplicam/somam no mesmo total — <code style={{ color: bl, fontSize: '9px' }}>me = (_ME + tilt_estilo·0.5) × g(Δ)</code> — então um confronto de estilos ofensivos num grande desnível acumula os dois efeitos. E a Goleada trabalha junto com o <strong>Favoritismo</strong> (o c0): o c0 <em>redistribui</em> (favorito sobe, azarão desce) enquanto a Goleada <em>aumenta o total</em>; juntos, reproduzem tanto os gols do favorito quanto os do azarão observados na realidade. Ambos são toggles independentes, ligados por padrão; desligue a Goleada para voltar ao total constante.</p>
              <p><strong style={{ color: tx }}>PELE:</strong> 79 seleções fornecidas pelo usuário (75 + Catar/Cabo Verde/Curaçao/Jamaica). Cobertura completa das 54 seleções do simulador.</p>
              <p><strong style={{ color: tx }}>📜 Confrontos em Copas:</strong> histórico de jogos de Copas do Mundo (1930-2022) entre as seleções do simulador, exibido nos cards de Resultados e em Cruzamentos ▸ Duelo. Fonte: <strong style={{ color: acc }}>Fjelstul World Cup Database</strong> (github.com/jfjelstul/worldcup, licença CC-BY 4.0). Sucessores oficiais contam (Alemanha Ocidental → Alemanha, Tchecoslováquia → Tchéquia); empates decididos nos pênaltis contam como empate no retrospecto.</p>
              <p><strong style={{ color: tx }}>R32:</strong> M73(2A×2B) M74(1E×3°) M75(1F×2C) M76(1C×2F) M77(1I×3°) M78(2E×2I) M79(1A×3°) M80(1L×3°) M81(1D×3°) M82(1G×3°) M83(2K×2L) M84(1H×2J) M85(1B×3°) M86(1J×2H) M87(1K×3°) M88(2D×2G)</p>
              <p><strong style={{ color: tx }}>R16:</strong> M89(W74×W77) M90(W73×W75) M91(W76×W78) M92(W79×W80) M93(W83×W84) M94(W81×W82) M95(W86×W88) M96(W85×W87)</p>
              <p><strong style={{ color: tx }}>QF:</strong> M97(W89×W90) M98(W93×W94) M99(W91×W92) M100(W95×W96)</p>
              <p><strong style={{ color: tx }}>SF:</strong> M101(W97×W98) Pathway 1 | M102(W99×W100) Pathway 2</p>
              <p><strong style={{ color: tx }}>Pools 3°:</strong> 1A(CEFHI) 1B(EFGIJ) 1D(BEFIJ) 1E(ABCDF) 1G(AEHIJ) 1I(CDFGH) 1K(DEIJL) 1L(EHIJK). <strong>Todas as 495 combinações</strong> do Anexo C do regulamento FIFA estão codificadas — lookup O(1), sem solver.</p>
              <p><strong style={{ color: tx }}>Resultados & Filtro:</strong> Aba 📝 permite fixar placares reais manualmente ou via JSON, e a sub-aba 🔎 <strong>Filtrar</strong> aplica condições (ex.: "Brasil é campeão", "Argentina chega à final", "Espanha enfrenta a França nas quartas") combinadas em E. O Monte Carlo mantém só as simulações que satisfazem todas as condições e recalcula tudo sobre elas (probabilidade condicional, por amostragem por rejeição). A taxa de aceitação exibida estima a probabilidade do conjunto de condições. Formato JSON aceito: <code style={{ color: bl, fontSize: '9px' }}>[{"{"}match:1, gA:2, gB:1{"}"}, ...]</code> onde match = número do jogo (1-72), ou <code style={{ color: bl, fontSize: '9px' }}>[{"{"}home:"Brazil", away:"Morocco", gA:2, gB:1{"}"}, ...]</code> com nomes dos times.</p>
              <h3 style={{ color: acc, margin: '16px 0 8px', fontSize: '13px' }}>Calculadora 1° vs 3° (Anexo C)</h3>
              <div style={{ fontSize: '9px', color: dm, marginBottom: '6px' }}>Marque quais 3°s vão (✓) ou não vão (✗) avançar. Sem marca = indefinido. A tabela filtra as 495 combinações.</div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {[...'ABCDEFGHIJKL'].map(g => {
                  const st = g3filter[g];
                  return <button key={g} onClick={() => setG3filter(p => { const n={...p}; if(!n[g])n[g]='in'; else if(n[g]==='in')n[g]='out'; else delete n[g]; return n; })} style={{ padding:'2px 6px',fontSize:'10px',fontWeight:700,borderRadius:'4px',cursor:'pointer',border:`1px solid ${st==='in'?'#22c55e':st==='out'?'#ef4444':bd}`,background:st==='in'?'#22c55e22':st==='out'?'#ef444422':'transparent',color:st==='in'?'#22c55e':st==='out'?'#ef4444':dm }}>{g}{st==='in'?'✓':st==='out'?'✗':''}</button>;
                })}
                {Object.keys(g3filter).length > 0 && <button onClick={() => setG3filter({})} style={{ padding:'2px 6px',fontSize:'9px',color:'#ef4444',background:'transparent',border:'1px solid #ef444444',borderRadius:'4px',cursor:'pointer' }}>Limpar</button>}
              </div>
              {(() => {
                const W8 = ['A','B','D','E','G','I','K','L'];
                const acRaw = AC_RAW.split('|').map(e => { const [k,v]=e.split(':'); return {groups:k,assign:v}; });
                const ins = Object.entries(g3filter).filter(([,v])=>v==='in').map(([g])=>g);
                const outs = Object.entries(g3filter).filter(([,v])=>v==='out').map(([g])=>g);
                const filtered = acRaw.filter(({groups:gs}) => {
                  for(const g of ins) if(!gs.includes(g)) return false;
                  for(const g of outs) if(gs.includes(g)) return false;
                  return true;
                });
                const freq = {};
                W8.forEach(w => { freq[w] = {}; });
                filtered.forEach(({assign}) => { for(let i=0;i<8;i++) { const g3=assign[i]; freq[W8[i]][g3]=(freq[W8[i]][g3]||0)+1; } });
                const n = filtered.length;
                return (<>
                  <div style={{ fontSize: '10px', color: bl, marginBottom: '4px', fontWeight: 600 }}>{n} de 495 combinações ({ins.length} in, {outs.length} out)</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', fontSize: '10px', width: '100%' }}>
                      <thead><tr style={{ borderBottom: `1px solid ${bd}` }}>
                        <th style={{ padding: '3px 6px', textAlign: 'left', color: dm }}>1° de</th>
                        {[...'ABCDEFGHIJKL'].map(g => <th key={g} style={{ padding: '3px 4px', color: g3filter[g]==='in'?'#22c55e':g3filter[g]==='out'?'#ef4444':dm, textAlign: 'center', fontWeight: g3filter[g] ? 700 : 400 }}>3°{g}</th>)}
                      </tr></thead>
                      <tbody>
                        {W8.map((w, ri) => (
                          <tr key={w} style={{ borderBottom: `1px solid ${bd}22`, background: ri % 2 ? '#0d111d' : 'transparent' }}>
                            <td style={{ padding: '3px 6px', fontWeight: 700, color: acc }}>1°{w}</td>
                            {[...'ABCDEFGHIJKL'].map(g => {
                              const v = freq[w][g] || 0;
                              const pct = n > 0 ? (v/n*100) : 0;
                              return <td key={g} style={{ padding: '3px 4px', textAlign: 'center', color: v > 0 ? (pct > 50 ? '#22c55e' : pct > 15 ? bl : dm) : `${bd}44`, fontWeight: pct > 50 ? 700 : 400 }}>{v > 0 ? `${v}` : '·'}{v > 0 && n < 495 ? <span style={{fontSize:'7px',color:dm}}> {pct.toFixed(0)}%</span> : null}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ fontSize: '9px', color: dm, marginTop: '4px' }}>Quando filtrado, mostra contagem + % das combinações restantes.</div>
                </>);
              })()}
              <div style={{ fontSize: '9px', color: dm, marginBottom: '6px' }}>Dado o conjunto de 8 grupos cujos 3°s avançam, qual 3° enfrenta qual 1°:</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: '9px', width: '100%' }}>
                  <thead><tr style={{ borderBottom: `1px solid ${bd}` }}>
                    <th style={{ padding: '3px 4px', textAlign: 'left', color: dm }}>3°s que avançam</th>
                    <th style={{ padding: '3px', color: dm }}>vs1A</th><th style={{ padding: '3px', color: dm }}>vs1B</th>
                    <th style={{ padding: '3px', color: dm }}>vs1D</th><th style={{ padding: '3px', color: dm }}>vs1E</th>
                    <th style={{ padding: '3px', color: dm }}>vs1G</th><th style={{ padding: '3px', color: dm }}>vs1I</th>
                    <th style={{ padding: '3px', color: dm }}>vs1K</th><th style={{ padding: '3px', color: dm }}>vs1L</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ['BCDEFGHI','E','B','F','C','H','D','I','G'],
                      ['BCDEFGHJ','E','B','F','C','H','D','J','G'],
                      ['BCDEFGIJ','E','B','I','C','J','D','G','F'],
                      ['BCDEFHIJ','E','B','I','C','H','D','J','F'],
                      ['BCDEGHIJ','E','B','I','C','H','D','J','G'],
                      ['BCDFGHIJ','C','B','F','D','H','G','J','I'],
                      ['BCEFGHIJ','E','B','F','C','H','G','I','J'],
                      ['BDEFGHIJ','H','B','D','E','I','F','J','G'],
                      ['ACDEFGHI','E','F','A','C','H','D','I','G'],
                      ['ACDEFGHJ','E','F','A','C','H','D','J','G'],
                      ['ACDEFGIJ','E','A','J','C','G','D','I','F'],
                      ['ACDEFHIJ','H','F','A','C','E','D','I','J'],
                      ['ACDEGHIJ','E','A','J','C','H','D','I','G'],
                      ['ACDFGHIJ','C','A','F','D','H','G','J','I'],
                      ['ACEFGHIJ','E','A','F','C','H','G','I','J'],
                      ['ADEFGHIJ','H','A','D','E','I','F','J','G'],
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${bd}22`, background: i % 2 ? '#0d111d' : 'transparent' }}>
                        <td style={{ padding: '2px 4px', fontWeight: 600, color: gn, fontFamily: 'monospace' }}>{row[0]}</td>
                        {row.slice(1).map((v, j) => (
                          <td key={j} style={{ padding: '2px 3px', textAlign: 'center', color: bl, fontFamily: 'monospace' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: '9px', color: dm, marginTop: '4px' }}>Amostra de 16 das 495 combinações. Tabela completa do Anexo C codificada no simulador.</div>
            </div>
          </div>
        )}

      </main>
      </>)}

      <footer style={{ textAlign: 'center', padding: '12px', fontSize: '9px', color: dm, borderTop: `1px solid ${bd}` }}>
        <div>FIFA World Cup 2026 Simulator • Poisson + ELO/PELE Monte Carlo • 48 teams • 104 matches • 4 ratings + Tilt</div>
        <div style={{ marginTop: '4px', color: acc }}>henrique.noronha • 4/jun/2026</div>
      </footer>
    </div>
  );
}
