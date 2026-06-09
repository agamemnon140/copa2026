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
// BRT offset by city (hours ahead of local to get BRT; BRT = UTC-3)
const TZ = {'Cidade do México':0,'Guadalajara':0,'Monterrey':0,'Toronto':-1,'Vancouver':-2,'Los Angeles':-2,'São Francisco':-2,'Seattle':-2,'Dallas':0,'Houston':0,'Kansas City':0,'Atlanta':-1,'Miami':-1,'Nova York/NJ':-1,'Boston':-1,'Filadélfia':-1,'MetLife':-1};
// BRT kickoff times (FIFA oficial, ordem por match number) — fase de grupos (1-72) e mata-mata (73-104)
const GS_BRT = ['16:00','23:00','16:00','22:00','01:00','16:00','19:00','22:00','14:00','17:00','20:00','23:00','13:00','16:00','19:00','22:00','22:00','16:00','19:00','01:00','14:00','17:00','20:00','21:00','13:00','16:00','19:00','22:00','00:00','16:00','19:00','21:30','14:00','17:00','21:00','23:00','13:00','16:00','19:00','22:00','14:00','18:00','21:00','00:00','14:00','17:00','20:00','23:00','16:00','16:00','19:00','19:00','22:00','22:00','17:00','17:00','20:00','20:00','23:00','23:00','16:00','16:00','21:00','21:00','00:00','00:00','18:00','18:00','20:30','20:30','23:00','23:00'];
const KO_BRT = {73:'16:00',74:'17:30',75:'22:00',76:'14:00',77:'18:00',78:'14:00',79:'22:00',80:'13:00',81:'21:00',82:'17:00',83:'20:00',84:'16:00',85:'00:00',86:'19:00',87:'22:30',88:'15:00',89:'18:00',90:'14:00',91:'17:00',92:'21:00',93:'16:00',94:'21:00',95:'13:00',96:'17:00',97:'17:00',98:'16:00',99:'18:00',100:'22:00',101:'16:00',102:'16:00',103:'18:00',104:'16:00'};
const KO_DATE = {73:'28/Jun',74:'29/Jun',75:'29/Jun',76:'29/Jun',77:'30/Jun',78:'30/Jun',79:'30/Jun',80:'1/Jul',81:'1/Jul',82:'1/Jul',83:'2/Jul',84:'2/Jul',85:'3/Jul',86:'3/Jul',87:'3/Jul',88:'3/Jul',89:'4/Jul',90:'4/Jul',91:'5/Jul',92:'5/Jul',93:'6/Jul',94:'6/Jul',95:'7/Jul',96:'7/Jul',97:'9/Jul',98:'10/Jul',99:'11/Jul',100:'11/Jul',101:'14/Jul',102:'15/Jul',103:'18/Jul',104:'19/Jul'};
const KO_CITY = {73:'Los Angeles',74:'Boston',75:'Monterrey',76:'Houston',77:'Nova York/NJ',78:'Dallas',79:'Cd. México',80:'Atlanta',81:'S. Francisco',82:'Seattle',83:'Toronto',84:'Los Angeles',85:'Vancouver',86:'Miami',87:'Kansas City',88:'Dallas',89:'Filadélfia',90:'Houston',91:'Nova York/NJ',92:'Cd. México',93:'Dallas',94:'Seattle',95:'Atlanta',96:'Vancouver',97:'Boston',98:'Los Angeles',99:'Miami',100:'Kansas City',101:'Dallas',102:'Atlanta',103:'Miami',104:'MetLife'};
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
const INJ_ELO = 18; // queda de Elo por lesão de titular importante (~15-20 é uma boa representação)
const rtBase = t => _rSys === 'custom' ? (_customElo[t] || ELO[t] || 1400) : _rSys === 'elo' ? (ELO[t] || 1400) : _rSys === 'bet' ? (BET[t] || 1400) : _rSys === 'pele' ? (PELE[t] || ELO[t] || 1400) : (FP[t] || 1400);
const tiltOf = t => (_useTilt && TILT[t] != null) ? TILT[t] : 0;
const matchTilt = (tA, tB) => tiltOf(tA) + tiltOf(tB); // soma dos dois times = shift no total de gols

const pp = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
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
const sP = (l) => { let r = Math.random(), a = 0; for (let g = 0; g <= 7; g++) { a += pp(l, g); if (r < a) return g; } return 7; };
const sM = (a, b, tA = '', tB = '') => { const { la, lb } = cL(a, b, matchTilt(tA, tB)); return { gA: sP(la), gB: sP(lb) }; };
const sKO = (a, b, tA = '', tB = '') => {
  const mt = matchTilt(tA, tB);
  let { gA, gB } = sM(a, b, tA, tB); let aet = false, pen = false;
  if (gA === gB) { aet = true; const { la, lb } = cL(a, b, mt); gA += sP(la * .33); gB += sP(lb * .33); }
  if (gA === gB) { pen = true; const penW = Math.random() < .5 + (a - b) / 4000 ? 'A' : 'B'; return { w: penW, gA, gB, aet, pen }; }
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

// In-game probabilities: minute (0-90+), current score, red cards per side
// Models: remaining lambda = full lambda * (90-min)/90. Red cards apply 0.78x to fouler, 1.12x to opponent (per red).
const liveProbs = (a, b, tA, tB, minute, scoreA, scoreB, redsA, redsB) => {
  const { la, lb } = cL(a, b, matchTilt(tA, tB));
  const remFrac = Math.max(0, Math.min(1.05, (90 - minute) / 90)); // allow slight extra for stoppage
  const adjA = Math.pow(0.78, redsA) * Math.pow(1.12, redsB);
  const adjB = Math.pow(0.78, redsB) * Math.pow(1.12, redsA);
  const laR = Math.max(0.001, la * remFrac * adjA);
  const lbR = Math.max(0.001, lb * remFrac * adjB);
  let pH = 0, pD = 0, pA = 0;
  for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) {
    const p = pp(laR, i) * pp(lbR, j);
    const fA = scoreA + i, fB = scoreB + j;
    if (fA > fB) pH += p; else if (fA === fB) pD += p; else pA += p;
  }
  const t = pH + pD + pA;
  return { pH: pH / t * 100, pD: pD / t * 100, pA: pA / t * 100, laR, lbR, expScoreA: scoreA + laR, expScoreB: scoreB + lbR };
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
const rankTied = (block, tb, gm, crit) => {
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
      const byOverall = [...same].sort((a, b) => tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf || (FP[b] || 0) - (FP[a] || 0) || Math.random() - .5);
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
const rankGroup = (teams, tb, gm) => {
  const crit = {};
  const byPts = [...teams].sort((a, b) => tb[b].pts - tb[a].pts);
  const sorted = [];
  let i = 0;
  while (i < byPts.length) {
    let j = i + 1;
    while (j < byPts.length && tb[byPts[j]].pts === tb[byPts[i]].pts) j++;
    const block = byPts.slice(i, j);
    const ordered = rankTied(block, tb, gm, crit);
    ordered.forEach(t => sorted.push(t));
    if (j < byPts.length) crit[sorted[sorted.length - 1]] = 'pts';
    i = j;
  }
  return { sorted, crit };
};
// ──────────────────────────────────────────────────────────────────────────────

const runSim = (groups, ur, fp) => {
  const tb = {};
  for (const [gn, ts] of Object.entries(groups)) ts.forEach(t => { tb[t] = { g: gn, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 }; });
  const pos = {};

  const gm = GS.map(([gn, hi, ai, date, city], idx) => {
    const ts = groups[gn], h = ts[hi], a = ts[ai];
    const rr = ur && ur[idx];
    let gA, gB;
    if (rr && rr.gA != null && rr.gB != null) { gA = rr.gA; gB = rr.gB; }
    else { const im = _injM[idx]; const r = sM(efCity(h, city) - (im ? (im.h || 0) * INJ_ELO : 0), efCity(a, city) - (im ? (im.a || 0) * INJ_ELO : 0), h, a); gA = r.gA; gB = r.gB; }
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
    let s, crit = {};
    if (forced && forced.some(Boolean)) {
      const set = forced.filter(Boolean);
      const unset = ts.filter(t => !set.includes(t));
      const sortedUnset = rankGroup(unset, tb, gm).sorted;
      s = [];
      let ui = 0;
      for (let i = 0; i < 4; i++) {
        if (forced[i]) s.push(forced[i]);
        else if (i < 3 && sortedUnset[ui]) s.push(sortedUnset[ui++]);
        else if (sortedUnset[ui]) s.push(sortedUnset[ui++]);
      }
      while (s.length < 4 && ui < sortedUnset.length) s.push(sortedUnset[ui++]);
    } else {
      const rk = rankGroup(ts, tb, gm); s = rk.sorted; crit = rk.crit;
    }
    Object.assign(tieCrit, crit);
    st[gn] = { sorted: s, tb: Object.fromEntries(s.map(t => [t, tb[t]])) };
    s.forEach((t, i) => { pos[t] = gn + (i + 1); });
  }

  const thirds = Object.entries(st).map(([g, { sorted }]) => ({ team: sorted[2], group: g, ...tb[sorted[2]] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || (FP[b.team] || 0) - (FP[a.team] || 0) || Math.random() - .5);
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
    } else r = sKO(ef(h), ef(a), h, a);
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
    } else r = sKO(efCity(h, c), efCity(a, c), h, a);
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
  return { p, g3p, muPct, comboList, tmPct, posMu, posTm, posWho, tmPos, posVsTm, matchTm, matchWho, matchPos, duelPos, tpc, matchByG3, matchChamp, gsShift, koShift, cutoff3rd, scoreDist, tieAcc, recAdv, nAccepted };
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

// Re-agrega um pool existente sob novas condições — instantâneo, mesmo universo de sims (sem ruído).
const reaggregate = (pool, all, groups, conditions = []) => {
  const agg = aggregate(pool, all, groups, conditions);
  return { ...agg, n: pool.length };
};

// ============================================================================
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
  const [res, setRes] = useState(null);
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
  const [matchPosData, setMatchPosData] = useState(null);
  const [duelPosData, setDuelPosData] = useState(null);
  const [duelExpand, setDuelExpand] = useState(null); // round name when expanded
  const [liveCard, setLiveCard] = useState(null); // idx of GS card expanded for in-game calc
  const [liveInputs, setLiveInputs] = useState({}); // { [idx]: { min, gA, gB, redsA, redsB } }
  const [evoData, setEvoData] = useState(null); // evolution snapshots
  const [evoTeams, setEvoTeams] = useState(['Brazil','Argentina','Spain','France']);
  const [evoMetric, setEvoMetric] = useState('ch');
  const [evoView, setEvoView] = useState('chart'); // 'chart' | 'models'
  const [bsData, setBsData] = useState(null); // resultado do backtest de modelos
  const [bsLoading, setBsLoading] = useState(false);
  const [evoLoading, setEvoLoading] = useState(false);
  const [evoFilterTeam, setEvoFilterTeam] = useState(''); // '' = todos os jogos; nome do time = só jogos dele
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
  const [resStat, setResStat] = useState('mode'); // 'mode' | 'median' | 'mean' para o placar de referência nos cards
  const [grpView, setGrpView] = useState('');
  const [grpStat, setGrpStat] = useState('mean'); // 'mean' | 'median' para pts/gols na view Por Grupo
  const [grpWDL, setGrpWDL] = useState(false); // mostrar colunas V/E/D na view Por Grupo
  const [eloPhase, setEloPhase] = useState('all');
  const [duelA, setDuelA] = useState('Brazil');
  const [scFilter, setScFilter] = useState('all');
  const [duelB, setDuelB] = useState('Argentina'); // '' = groups, 'po' = playoffs
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

  const groups = useMemo(() => rG(pc), [pc]);
  const all = useMemo(() => Object.values(groups).flat(), [groups]);

  // Pool de simulações da última rodada do MC — permite re-filtrar em memória sem re-simular.
  const poolRef = useRef(null);

  // Aplica um resultado agregado (de runMC ou reaggregate) em todos os estados das abas.
  const applyAgg = (r) => {
    setRes(r.p); setG3p(r.g3p); setMuPct(r.muPct); setComboList(r.comboList); setTmPct(r.tmPct); setPosMu(r.posMu); setPosTm(r.posTm); setPosWho(r.posWho); setTmPosData(r.tmPos); setPosVsTmData(r.posVsTm); setMatchTmData(r.matchTm); setMatchWhoData(r.matchWho); setMatchPosData(r.matchPos); setDuelPosData(r.duelPos); setTpcData(r.tpc); setMatchByG3Data(r.matchByG3); setMatchChampData(r.matchChamp); setGsShiftData(r.gsShift); setKoShiftData(r.koShift); setCutoff3rdData(r.cutoff3rd); setScoreDistData(r.scoreDist); setTieAccData(r.tieAcc); setRecAdvData(r.recAdv);
  };

  const doMC = () => {
    const N = Math.max(100, Math.floor(+nSim) || 10000); // tolera campo vazio/inválido; sem teto superior
    setRunning(true);
    setTimeout(() => {
      _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; _fav = favWeight; _spread = spread; _injM = injuries; _hb = homeAdv;
      const r = runMC(groups, N, userRes, conditions);
      poolRef.current = { pool: r.pool, all: r.all, groups }; // guarda o universo para re-filtragem instantânea
      applyAgg(r);
      setMcMeta({ nAccepted: r.nAccepted, n: r.n, conds: conditions });
      setRunning(false); setTab('probs');
    }, 50);
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
      const sv = { rSys: _rSys, tilt: _useTilt, fav: _fav, hb: _hb, inj: _injM };
      _injM = {}; // backtest histórico não aplica lesões (são prospectivas)
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
      _rSys = sv.rSys; _useTilt = sv.tilt; _fav = sv.fav; _hb = sv.hb; _injM = sv.inj;
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
        <button onClick={doMC} disabled={running} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 700, color: '#000', background: `linear-gradient(135deg,${gd},${acc})`, border: 'none', borderRadius: '6px', cursor: running ? 'wait' : 'pointer' }}>
          {running ? '⏳...' : `▶ ${(+nSim || 0).toLocaleString()}`}
        </button>
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
        {nFx > 0 && <span style={{ fontSize: '10px', color: gn }}>✓ {nFx} fixo(s)</span>}
        {conditions.length > 0 && <span style={{ fontSize: '10px', color: acc }}>🔎 {conditions.length} condição(ões)</span>}
        {mcMeta && mcMeta.conds && mcMeta.conds.length > 0 && <span style={{ fontSize: '10px', color: mcMeta.nAccepted < 200 ? rd : gn }}>· {mcMeta.nAccepted.toLocaleString()}/{mcMeta.n.toLocaleString()} aceitas ({(mcMeta.nAccepted / mcMeta.n * 100).toFixed(1)}%)</span>}
      </div>

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

              // Match box component
              const MB = ({ mn, hTeam, aTeam, hPos, aPos, winner, city, label }) => (
                <div style={{ background: '#0d111d', borderRadius: '3px', border: `1px solid ${bd}`, minWidth: '130px', maxWidth: '165px' }}>
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
                  <div style={{ background: card, borderRadius:'4px', border:`1px solid ${bd}`, minWidth:'115px', maxWidth:'145px' }}>
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

                  {/* 3rd-place summary */}
                  {g3p && <div style={{ marginBottom:'12px', padding:'6px 10px', background:card, borderRadius:'6px', border:`1px solid ${bd}`, maxWidth:'600px' }}>
                    <div style={{ fontSize:'9px', fontWeight:700, color:bl, marginBottom:'3px' }}>8 melhores 3°s (por prob. individual; Anexo C: {bestCombo})</div>
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
              <span style={{ fontSize: '9px', color: dm }}>Pts, SG, GM{grpWDL ? ', V/E/D' : ''} mostram a {grpStat === 'median' ? 'mediana' : grpStat === 'mode' ? 'moda' : 'média'} por simulação.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '8px' }}>
              {Object.entries(groups).map(([gn, ts]) => {
                const sorted = ts.slice().sort((a, b) => (res[b]?.g1 || 0) - (res[a]?.g1 || 0));
                const stat = grpStat; // 'mean' | 'median' | 'mode'
                const pick = (avg, med, mod) => stat === 'mean' ? avg : stat === 'median' ? med : mod;
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
                        const adv = (r.g1 || 0) + (r.g2 || 0) + (r.g3a || 0);
                        const pts = pick(r.avgPts || 0, r.medPts || 0, r.modPts || 0);
                        const sg = pick(r.avgGd || 0, r.medGd || 0, r.modGd || 0);
                        const gm = pick(r.avgGf || 0, r.medGf || 0, r.modGf || 0);
                        return (
                          <tr key={t}>
                            <td style={{ padding: '3px 5px', fontWeight: 500 }}>{fl(t)} {nm(t)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', fontWeight: 600, color: tx }}>{fmtN(pts)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', color: sg > 0 ? '#22c55e' : sg < 0 ? '#ef4444' : dm }}>{sg > 0 ? '+' : ''}{fmtN(sg)}</td>
                            <td style={{ padding: '3px 5px', textAlign: 'right', color: tx }}>{fmtN(gm)}</td>
                            {grpWDL && [pick(r.avgW || 0, r.medW || 0, r.modW || 0), pick(r.avgD || 0, r.medD || 0, r.modD || 0), pick(r.avgL || 0, r.medL || 0, r.modL || 0)].map((v, i) => (
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
              <SB active={muView === 'confronto'} onClick={() => setMuView('confronto')}>Confronto</SB>
              <SB active={muView === 'path'} onClick={() => setMuView('path')}>Path</SB>
            </div>

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
                      <span style={{ fontSize: '11px', fontWeight: 700, color: i < 3 ? gd : acc, minWidth: '42px', textAlign: 'right' }}>{m.pct.toFixed(1)}%</span>
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
                        <span style={{ color: denom > 50 ? '#22c55e' : denom > 20 ? '#c9a84c' : '#ef4444', fontSize: '10px' }}>Chega: {denom.toFixed(1)}%</span>
                      </div>
                      {items.map((x, i) => {
                        const display = condMode && denom > 0 ? (x.pct / denom * 100) : x.pct;
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '11px' }}>
                            <span style={tmMode === 'pos' ? { fontFamily: 'monospace', color: bl } : {}}><span style={{ fontSize: '8px', color: dm, marginRight: '3px' }}>{i+1}.</span>{x.label}</span>
                            <span style={{ color: acc, fontWeight: 600 }}>{display.toFixed(1)}%</span>
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
                        <span style={{ fontWeight: 700, color: i < 3 ? bl : acc }}>{m.pct.toFixed(1)}%</span>
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
                      if (posMode === 'pos') {
                        const d = posTm?.[rd]?.[selPos] || {};
                        items = Object.entries(d).map(([opp, c]) => {
                          const oppBest = posWho?.[opp] ? Object.entries(posWho[opp]).sort((a,b)=>b[1]-a[1])[0]?.[0] : null;
                          return { label: opp, hint: oppBest ? `${fl(oppBest)}${nm(oppBest)}` : '', pct: (c / mcN) * 100 };
                        }).sort((a, b) => b.pct - a.pct);
                      } else {
                        const d = posVsTmData?.[rd]?.[selPos] || {};
                        items = Object.entries(d).map(([t, c]) => ({ label: `${fl(t)} ${nm(t)}`, hint: '', pct: (c / mcN) * 100 })).sort((a, b) => b.pct - a.pct);
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
                                <span style={{ color: acc, fontWeight: 600 }}>{display.toFixed(1)}%</span>
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
                          <span style={{ fontWeight: 700, color: i < 3 ? bl : acc }}>{condMode && totalPct > 0 ? normPct.toFixed(1) : c.pct.toFixed(1)}%</span>
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
              const pairs = (useFiltered ? Object.entries(filteredPairs) : (matchTmData[mn] ? Object.entries(matchTmData[mn]) : [])).map(([k, c]) => { const [a, b] = k.split('|'); return { a, b, pct: (c / dn) * 100 }; }).sort((x, y) => y.pct - x.pct);
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
                          <span style={{ color: i < 3 ? bl : acc, fontWeight: 600, minWidth: '42px', textAlign: 'right' }}>{p.pct.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {venueMode === 'team' && (
                    <div style={{ display: 'grid', gap: '2px' }}>
                      {teams.slice(0, 100).map((x, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', background: i < 3 ? `${bl}0a` : i % 2 === 0 ? 'transparent' : '#0d111d', borderRadius: '3px', fontSize: '11px' }}>
                          <span>{fl(x.t)} {nm(x.t)}</span>
                          <span style={{ color: i < 3 ? bl : acc, fontWeight: 600, minWidth: '42px', textAlign: 'right' }}>{x.pct.toFixed(1)}%</span>
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
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: bl }}>Probabilidade de confronto entre dois times</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <select value={duelA} onChange={e => setDuelA(e.target.value)} style={{ padding: '6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
                  {all.sort((a, b) => rt(b) - rt(a)).map(t => <option key={t} value={t}>{nm(t)}</option>)}
                </select>
                <span style={{ color: dm, fontSize: '13px' }}>vs</span>
                <select value={duelB} onChange={e => setDuelB(e.target.value)} style={{ padding: '6px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
                  {all.sort((a, b) => rt(b) - rt(a)).map(t => <option key={t} value={t}>{nm(t)}</option>)}
                </select>
              </div>
              {duelA === duelB ? <div style={{ color: dm, fontSize: '11px' }}>Selecione dois times diferentes.</div> : (() => {
                const k1 = [duelA, duelB].sort().join('|');
                const grpA = Object.entries(groups).find(([,ts]) => ts.includes(duelA))?.[0];
                const grpB = Object.entries(groups).find(([,ts]) => ts.includes(duelB))?.[0];
                const sameGroup = grpA === grpB;
                // Group stage: check if they play each other
                const gsMatch = sameGroup ? GS.findIndex(([gn, hi, ai]) => {
                  const ts = groups[gn];
                  return (ts[hi] === duelA && ts[ai] === duelB) || (ts[hi] === duelB && ts[ai] === duelA);
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
                const eA = efCity(duelA, 'MetLife'), eB = efCity(duelB, 'MetLife');
                const pr = mProbs(eA, eB, duelA, duelB);

                return (
                  <div style={{ maxWidth: '500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px', background: card, borderRadius: '8px', border: `1px solid ${bd}` }}>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '20px' }}>{fl(duelA)}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{nm(duelA)}</div>
                        <div style={{ fontSize: '10px', color: dm }}>{rt(duelA)} pts • Grupo {grpA}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0 10px' }}>
                        <div style={{ fontSize: '9px', color: dm }}>Se se enfrentarem</div>
                        <div style={{ fontSize: '11px' }}><span style={{ color: '#22c55e' }}>{pr.pH.toFixed(0)}%</span> <span style={{ color: dm }}>—</span> <span style={{ color: bl }}>{pr.pD.toFixed(0)}%</span> <span style={{ color: dm }}>—</span> <span style={{ color: '#ef4444' }}>{pr.pA.toFixed(0)}%</span></div>
                      </div>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '20px' }}>{fl(duelB)}</div>
                        <div style={{ fontSize: '12px', fontWeight: 700 }}>{nm(duelB)}</div>
                        <div style={{ fontSize: '10px', color: dm }}>{rt(duelB)} pts • Grupo {grpB}</div>
                      </div>
                    </div>

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
                          const posA = first === duelA ? pF : pS;
                          const posB = first === duelA ? pS : pF;
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
                            <span style={{ fontSize: '10px', fontWeight: 600, color: pct > 5 ? gd : pct > 1 ? acc : dm, minWidth: '40px', textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                          </div>
                          {isExp && breakdown && breakdown.length > 0 && (
                            <div style={{ marginLeft: '12px', padding: '6px 10px 8px', background: `${card}aa`, borderLeft: `2px solid ${acc}`, marginTop: '3px', marginBottom: '6px', borderRadius: '0 4px 4px 0' }}>
                              <div style={{ fontSize: '9px', color: dm, marginBottom: '4px' }}>Cenários de qualificação ({breakdown.length}) que levam a este encontro:</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '12px 60px 1fr 60px 12px', gap: '4px', fontSize: '8px', color: dm, marginBottom: '2px', fontWeight: 600 }}>
                                <span></span><span>{nm(duelA)}</span><span></span><span style={{ textAlign: 'right' }}>{nm(duelB)}</span><span></span>
                              </div>
                              {breakdown.slice(0, 20).map((b, i) => {
                                const wPct = pct > 0 ? (b.pct / pct) * 100 : 0;
                                const barBd = maxBd > 0 ? (b.pct / maxBd) * 100 : 0;
                                return (
                                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '12px 60px 1fr 60px 60px', gap: '4px', alignItems: 'center', fontSize: '10px', padding: '2px 0' }}>
                                    <span>{fl(duelA)}</span>
                                    <span style={{ color: tx, fontWeight: 600, fontFamily: 'monospace' }}>{posLabel(b.posA)}</span>
                                    <div style={{ background: `${bd}33`, borderRadius: '2px', height: '8px', overflow: 'hidden' }}>
                                      <div style={{ background: acc, height: '100%', width: `${barBd}%`, opacity: 0.7 }}/>
                                    </div>
                                    <span style={{ color: tx, fontWeight: 600, fontFamily: 'monospace', textAlign: 'right' }}>{posLabel(b.posB)} {fl(duelB)}</span>
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
              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: bl }}>Corte do 8° melhor terceiro colocado</div>
                <div style={{ fontSize: '10px', color: dm, marginBottom: '10px' }}>Em cada simulação, os 12 terceiros são ranqueados por pontos, saldo e gols. O 8° (último a avançar) define o corte. Abaixo, a frequência de cada combinação.</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${gd}44`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Mediana do corte (50%)</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: gd }}>{medLabel}</div>
                  </div>
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
              return (<>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: bl }}>Frequência de placares</div>
                <div style={{ fontSize: '10px', color: dm, marginBottom: '8px' }}>Placares normalizados (maior×menor). {scFilter === 'gs' ? `${gsTotal.toLocaleString()} jogos de grupo.` : scFilter === 'ko' ? `${koTotal.toLocaleString()} jogos de mata-mata (incluindo prorrogação).` : `${total.toLocaleString()} jogos totais.`}</div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
                  {[['all','Todos'],['gs','Grupos'],['ko','Mata-mata']].map(([id,l]) => (
                    <SB key={id} active={scFilter === id} onClick={() => setScFilter(id)}>{l}</SB>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Gols/jogo</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: acc }}>{avgGoals.toFixed(2)}</div>
                  </div>
                  <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: dm }}>Empates</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: bl }}>{drawPct.toFixed(1)}%</div>
                  </div>
                </div>
                <div style={{ maxWidth: '480px' }}>
                  {rows.map((r, i) => (
                    <div key={r.score} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 52px 44px', gap: '6px', alignItems: 'center', padding: '2px 0' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: r.margin === 0 ? bl : tx, textAlign: 'center', fontFamily: 'monospace' }}>{r.score}</span>
                      <div style={{ background: `${bd}44`, borderRadius: '3px', height: '16px', overflow: 'hidden' }}>
                        <div style={{ background: r.margin === 0 ? bl : r.margin >= 3 ? '#ef4444' : r.margin >= 2 ? '#f97316' : '#22c55e', height: '100%', width: `${r.cnt / maxCnt * 100}%`, borderRadius: '3px', opacity: 0.8 }}/>
                      </div>
                      <span style={{ fontSize: '9px', color: dm, textAlign: 'right' }}>{r.cnt.toLocaleString()}</span>
                      <span style={{ fontSize: '10px', color: r.pct > 10 ? tx : dm, textAlign: 'right', fontWeight: r.pct > 10 ? 600 : 400 }}>{r.pct.toFixed(1)}%</span>
                    </div>
                  ))}
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

            {muView === 'confronto' && (() => {
              const teamsAll = Object.values(groups).flat().sort((x, y) => nm(x).localeCompare(nm(y)));
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
              const SEL = { padding: '5px 8px', background: '#0d111d', color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '13px', fontWeight: 600 };
              const moreBtn = (key, total, shown) => total > shown ? <button onClick={() => setConfExp(p => ({ ...p, [key]: !p[key] }))} style={{ marginTop: '4px', padding: '2px 8px', fontSize: '9px', fontWeight: 700, background: 'transparent', color: acc, border: `1px solid ${acc}55`, borderRadius: '4px', cursor: 'pointer' }}>{confExp[key] ? 'ver menos ▴' : `ver mais ${total - shown} ▾`}</button> : null;
              return (
                <div>
                  <div style={{ fontSize: '11px', color: dm, marginBottom: '10px' }}>Distribuição exata de resultados entre duas seleções (equivale a infinitas simulações), com as configurações atuais de rating, tilts e favoritismo. Sem vantagem de mando (jogo neutro).</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <select value={confA} onChange={e => setConfA(e.target.value)} style={SEL}>{teamsAll.map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}</select>
                    <span style={{ color: dm, fontWeight: 700 }}>×</span>
                    <select value={confB} onChange={e => setConfB(e.target.value)} style={SEL}>{teamsAll.map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}</select>
                    <button onClick={() => setConfKO(v => !v)} style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 700, background: confKO ? `${acc}33` : card, color: confKO ? acc : dm, border: `1px solid ${confKO ? acc : bd}`, borderRadius: '5px', cursor: 'pointer' }}>{confKO ? '🥊 Mata-mata' : '⚽ Jogo normal'}</button>
                    <span style={{ fontSize: '9px', color: dm }}>ΔElo {a - b >= 0 ? '+' : ''}{a - b}</span>
                  </div>
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
                  Para cada time e cada posição no grupo (1°/2°/3°): o adversário mais provável em cada fase do mata-mata (com a % de enfrentá-lo, dado que chegou à fase) e a chance condicional de título se terminar naquela posição. Empilhado, ordenado por chance de título.
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
                        return { opp, faceProb: reached ? (cnt / reached) * 100 : 0 };
                      });
                      return { pn, finishFreq, condCh, path };
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
                              </div>
                              <div style={{ fontSize: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px' }}>
                                {RDS.map(([rk, rl], j) => {
                                  const step = r.path[j];
                                  return (
                                    <span key={rk} style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                      {j > 0 && <span style={{ color: dm, margin: '0 3px' }}>→</span>}
                                      <span style={{ color: dm, fontSize: '8px', marginRight: '2px' }}>{rl}</span>
                                      {step ? <>{fl(step.opp)} {nm(step.opp)} <span style={{ color: dm }}>{step.faceProb.toFixed(0)}%</span></> : <span style={{ color: dm }}>—</span>}
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
                if (!byDate[date]) byDate[date] = [];
                byDate[date].push({ idx, gn, home: groups[gn][hi], away: groups[gn][ai], date, city, brt: GS_BRT[idx] });
              });
              return Object.entries(byDate).map(([date, ms]) => {
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
                    const li = liveInputs[m.idx] || { min: 0, gA: 0, gB: 0, redsA: 0, redsB: 0 };
                    const liveP = isLive ? liveProbs(_eH, _eA, m.home, m.away, +li.min || 0, +li.gA || 0, +li.gB || 0, +li.redsA || 0, +li.redsB || 0) : null;
                    const setLI = (field, val) => setLiveInputs(p => ({ ...p, [m.idx]: { ...(p[m.idx] || { min: 0, gA: 0, gB: 0, redsA: 0, redsB: 0 }), [field]: val } }));
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
                        {isLive && (
                          <div style={{ marginTop: '8px', padding: '8px 10px', background: '#0d111d', borderRadius: '4px', border: `1px solid ${acc}33` }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: acc, marginBottom: '6px' }}>⏱️ Probabilidade ao vivo</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: '6px', alignItems: 'center', fontSize: '10px', marginBottom: '6px' }}>
                              <span style={{ color: dm }}>Min:</span>
                              <input type="range" min="0" max="95" value={li.min} onChange={e => setLI('min', +e.target.value)} style={{ width: '100%' }} />
                              <span style={{ fontWeight: 700, color: acc, minWidth: '32px' }}>{li.min}'</span>
                              <button onClick={() => setLI('min', 0)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>0'</button>
                              <button onClick={() => setLI('min', 45)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>HT</button>
                              <button onClick={() => setLI('min', 90)} style={{ padding: '1px 6px', fontSize: '9px', background: 'transparent', color: dm, border: `1px solid ${bd}`, borderRadius: '3px', cursor: 'pointer' }}>FT</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '9px', color: dm, marginBottom: '3px', textAlign: 'center' }}>{fl(m.home)} {nm(m.home)}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '9px' }}>
                                  <span style={{ color: dm }}>Gols:</span>
                                  <input type="number" min="0" max="20" value={li.gA} onChange={e => setLI('gA', +e.target.value || 0)} style={{ width: '36px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700 }} />
                                  <span style={{ color: dm, marginLeft: '4px' }}>🟥</span>
                                  <input type="number" min="0" max="3" value={li.redsA} onChange={e => setLI('redsA', +e.target.value || 0)} style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px' }} />
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '9px', color: dm, marginBottom: '3px', textAlign: 'center' }}>{fl(m.away)} {nm(m.away)}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center', fontSize: '9px' }}>
                                  <span style={{ color: dm }}>Gols:</span>
                                  <input type="number" min="0" max="20" value={li.gB} onChange={e => setLI('gB', +e.target.value || 0)} style={{ width: '36px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px', fontWeight: 700 }} />
                                  <span style={{ color: dm, marginLeft: '4px' }}>🟥</span>
                                  <input type="number" min="0" max="3" value={li.redsB} onChange={e => setLI('redsB', +e.target.value || 0)} style={{ width: '32px', padding: '2px', textAlign: 'center', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px' }} />
                                </div>
                              </div>
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
                            <div style={{ fontSize: '9px', color: dm, textAlign: 'center' }}>Placar final esperado: <strong style={{ color: tx }}>{liveP.expScoreA.toFixed(1)} - {liveP.expScoreB.toFixed(1)}</strong> • λ restante: {liveP.laR.toFixed(2)}/{liveP.lbR.toFixed(2)} gols</div>
                            <div style={{ fontSize: '8px', color: dm, marginTop: '4px', textAlign: 'center', fontStyle: 'italic' }}>Modelo: gols restantes ∝ tempo restante; cada cartão vermelho aplica 0.78× ao infrator e 1.12× ao adversário.</div>
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
                      </div>
                    );
                  })}
                </div>
              ); })
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
                  return Object.entries(byDate).map(([date, ms]) => {
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
                {single.r32.map((m, i) => <KO key={i} m={m} sp />)}
              </div>
            </>)}
            {(phase === 'r16') && (<>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: acc, margin: '12px 0 6px' }}>⚔️ R16</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '4px' }}>
                {single.r16.map((m, i) => <KO key={i} m={m} sp />)}
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

            {evoView === 'models' && (() => {
              const nFilled = GS.reduce((s, _, idx) => s + ((userRes[idx]?.gA != null && userRes[idx]?.gB != null) ? 1 : 0), 0);
              const RAT = { fifa: 'FIFA', elo: 'Elo', bet: 'Apostas', pele: 'PELE' };
              return (
                <div>
                  <div style={{ fontSize: '11px', color: dm, marginBottom: '10px', lineHeight: 1.5 }}>Compara 48 configurações de modelo (4 ratings × tilt on/off × favoritismo on/off × mando 0/70/150) contra os <strong>{nFilled}</strong> jogos de fase de grupos já preenchidos, medindo <strong>Brier</strong> e <strong>log-loss</strong> (menor = melhor). Útil para descobrir qual modelo está acertando mais durante a Copa. Lesões não entram (são prospectivas).</div>
                  <button onClick={runBacktest} disabled={bsLoading || nFilled < 1} style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 700, background: nFilled < 1 ? card : `${acc}33`, color: nFilled < 1 ? dm : acc, border: `1px solid ${nFilled < 1 ? bd : acc}`, borderRadius: '5px', cursor: nFilled < 1 ? 'default' : 'pointer', marginBottom: '12px' }}>{bsLoading ? 'Calculando…' : nFilled < 1 ? 'Preencha resultados de grupo primeiro' : `🔬 Rodar backtest (${nFilled} jogos)`}</button>
                  {bsData && bsData.n > 0 && (() => {
                    const best = bsData.results.find(r => !r.random); const bestLL = [...bsData.results].filter(r => !r.random).sort((a, b) => a.logloss - b.logloss)[0];
                    const randomEntry = bsData.results.find(r => r.random); const randomRank = bsData.results.indexOf(randomEntry) + 1;
                    const rows = bsData.results.slice(0, 20); const randomShown = rows.includes(randomEntry);
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
                        <div style={{ fontSize: '10px', color: dm, marginTop: '8px' }}>🏆 Melhor por Brier: <strong style={{ color: gn }}>{RAT[best.rs]}{best.tl ? ' +tilt' : ''}{best.fv ? ' +favorit.' : ''} · mando {best.hbv}</strong> (Brier {best.brier.toFixed(4)}). <strong style={{ color: acc }}>{bsData.nBeat}</strong> de 48 modelos superam o aleatório. Mostrando as 20 melhores de 48.</div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
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
              <p style={{ color: tx }}><strong style={{ color: acc }}>e) Probabilidade ao vivo (intra-jogo).</strong> Na aba 📝 Resultados, clique em qualquer card de jogo para expandir e calcular as chances V/E/D considerando o minuto atual, o placar parcial e cartões vermelhos. Modelo: gols restantes esperados são proporcionais ao tempo restante; cada vermelho aplica 0.78× ao infrator e 1.12× ao adversário sobre o λ (Poisson).</p>
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
