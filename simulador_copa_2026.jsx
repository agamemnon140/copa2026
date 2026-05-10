import React, { useState, useMemo, useRef, useEffect } from 'react';

/* Copa do Mundo FIFA 2026 - Simulador Monte Carlo v5 */

const PO={UEFA_A:{t:['Bosnia and Herzegovina','Italy'],l:'UEFA A: Bósnia 1(4)-1(1) Itália',w:0},UEFA_B:{t:['Sweden','Poland'],l:'UEFA B: Suécia 3-2 Polônia',w:0},UEFA_C:{t:['Türkiye','Kosovo'],l:'UEFA C: Turquia 1-0 Kosovo',w:0},UEFA_D:{t:['Czechia','Denmark'],l:'UEFA D: Tchéquia 2(3)-2(1) Dinamarca',w:0},IC1:{t:['DR Congo','Jamaica'],l:'IC1: RD Congo 1-0 Jamaica (AET)',w:0},IC2:{t:['Iraq','Bolivia'],l:'IC2: Iraque 2-1 Bolívia',w:0}}

const PT={'Spain':'Espanha','Argentina':'Argentina','France':'França','England':'Inglaterra','Brazil':'Brasil','Portugal':'Portugal','Netherlands':'Holanda','Morocco':'Marrocos','Belgium':'Bélgica','Germany':'Alemanha','Croatia':'Croácia','Senegal':'Senegal','Italy':'Itália','Colombia':'Colômbia','USA':'EUA','Mexico':'México','Uruguay':'Uruguai','Switzerland':'Suíça','Japan':'Japão','Iran':'Irã','Denmark':'Dinamarca','South Korea':'Coreia do Sul','Ecuador':'Equador','Austria':'Áustria','Türkiye':'Turquia','Australia':'Austrália','Algeria':'Argélia','Canada':'Canadá','Uzbekistan':'Uzbequistão','Egypt':'Egito','Norway':'Noruega','Paraguay':'Paraguai','Jordan':'Jordânia','Scotland':'Escócia','Czechia':'Tchéquia','Tunisia':'Tunísia','Saudi Arabia':'Arábia Saudita','Ivory Coast':'Costa do Marfim','Bosnia and Herzegovina':'Bósnia','Qatar':'Catar','Ghana':'Gana','South Africa':'África do Sul','DR Congo':'RD Congo','Kosovo':'Kosovo','Cape Verde':'Cabo Verde','Jamaica':'Jamaica','Panama':'Panamá','New Zealand':'Nova Zelândia','Haiti':'Haiti','Curaçao':'Curaçao','Sweden':'Suécia','Poland':'Polônia','Iraq':'Iraque','Bolivia':'Bolívia'};

const FP={'France':1886,'Spain':1874,'Argentina':1871,'England':1834,'Portugal':1765,'Brazil':1756,'Colombia':1704,'Morocco':1756,'Belgium':1730,'Netherlands':1728,'Germany':1724,'Croatia':1716,'Senegal':1714,'Mexico':1682,'USA':1678,'Uruguay':1672,'Japan':1654,'Switzerland':1654,'Ecuador':1594,'Türkiye':1592,'Austria':1585,'Australia':1574,'South Korea':1602,'Algeria':1560,'Egypt':1562,'Norway':1548,'Canada':1556,'Paraguay':1540,'Sweden':1548,'Scotland':1543,'Czechia':1546,'Iran':1540,'Uzbekistan':1535,'Bosnia and Herzegovina':1518,'Cape Verde':1514,'Tunisia':1510,'Ghana':1508,'Ivory Coast':1507,'Saudi Arabia':1505,'DR Congo':1498,'Iraq':1488,'Panama':1475,'Jordan':1474,'South Africa':1471,'Haiti':1466,'New Zealand':1464,'Curaçao':1380,'Qatar':1370};

// Elo Ratings (eloratings.net Mar/2026)
const ELO={'Spain':2165,'Argentina':2113,'France':2082,'England':2020,'Brazil':1984,'Portugal':1984,'Colombia':1975,'Netherlands':1961,'Ecuador':1933,'Croatia':1930,'Germany':1923,'Norway':1912,'Japan':1904,'Türkiye':1902,'Uruguay':1892,'Switzerland':1889,'Senegal':1879,'Belgium':1866,'Mexico':1858,'Paraguay':1833,'Austria':1827,'Morocco':1821,'Canada':1784,'Australia':1783,'Scotland':1767,'Iran':1760,'South Korea':1752,'Algeria':1743,'Panama':1737,'Uzbekistan':1727,'Czechia':1726,'USA':1721,'Sweden':1719,'Jordan':1690,'Egypt':1689,'Ivory Coast':1676,'DR Congo':1655,'Tunisia':1636,'Iraq':1607,'Bosnia and Herzegovina':1594,'New Zealand':1585,'Saudi Arabia':1568,'Cape Verde':1549,'Haiti':1532,'South Africa':1524,'Ghana':1505,'Curaçao':1436,'Qatar':1425}

// Implied Elo from betting odds (Mar/2026) -- calibrated: Elo = 2509 + 176×ln(p/100)
const BET={'Spain':2199,'England':2140,'France':2124,'Argentina':2093,'Brazil':2091,'Portugal':2067,'Germany':1992,'Norway':1898,'Netherlands':1892,'Belgium':1860,'USA':1860,'Colombia':1829,'Croatia':1820,'Morocco':1770,'Mexico':1758,'Japan':1715,'Uruguay':1715,'Austria':1698,'Australia':1698,'Canada':1698,'Switzerland':1698,'Denmark':1630,'Ecuador':1610,'Senegal':1590,'South Korea':1580,'Türkiye':1570,'Italy':1860,'Algeria':1500,'Egypt':1490,'Iran':1490,'Paraguay':1480,'Scotland':1470,'Poland':1470,'Sweden':1470,'Czechia':1450,'Tunisia':1430,'Saudi Arabia':1420,'Ivory Coast':1460,'Ghana':1400,'South Africa':1390,'Panama':1440,'Qatar':1380,'Cape Verde':1370,'New Zealand':1360,'Jordan':1380,'Uzbekistan':1380,'DR Congo':1400,'Haiti':1350,'Jamaica':1350,'Curaçao':1300,'Kosovo':1380,'Iraq':1380,'Bolivia':1350,'Bosnia and Herzegovina':1420};

// PELE Rating (Silver Bulletin / silverbulletin) — usuário forneceu 75 seleções. Faltam: Qatar, Cape Verde, Curaçao, Jamaica (estimados a partir do Elo).
const PELE={'Argentina':2065,'Spain':2064,'England':2010,'France':2008,'Brazil':2005,'Portugal':1952,'Germany':1946,'Colombia':1945,'Netherlands':1934,'Uruguay':1923,'Norway':1920,'Ecuador':1920,'Senegal':1894,'Japan':1885,'Italy':1880,'Türkiye':1876,'Belgium':1875,'Switzerland':1870,'Croatia':1866,'Paraguay':1851,'Denmark':1851,'Morocco':1843,'Mexico':1836,'Austria':1816,'Canada':1792,'Scotland':1791,'Algeria':1787,'Australia':1783,'Sweden':1773,'Ivory Coast':1772,'USA':1769,'South Korea':1766,'Poland':1765,'Egypt':1754,'Czechia':1753,'Hungary':1750,'Panama':1744,'Wales':1741,'Ireland':1739,'DR Congo':1738,'Peru':1737,'Kosovo':1730,'Iran':1725,'Slovenia':1722,'Slovakia':1715,'Mali':1710,'Cameroon':1705,'Israel':1703,'Romania':1700,'Tunisia':1699,'Georgia':1699,'Uzbekistan':1695,'Albania':1694,'Bosnia and Herzegovina':1690,'Costa Rica':1677,'Ghana':1673,'Burkina Faso':1672,'Northern Ireland':1670,'South Africa':1667,'Iceland':1663,'Bolivia':1655,'Jordan':1652,'New Zealand':1651,'Honduras':1638,'Iraq':1636,'Saudi Arabia':1631,'Haiti':1630,'Cape Verde':1617,'Jamaica':1609,'Qatar':1549,'Curaçao':1579};

// PELE Estimado (não fornecido pelo usuário) — flag para a UI. Vazio: todas 79 seleções fornecidas.
const PELE_EST=new Set();

// TILT Total — fator que muda o total de gols esperados na partida (atacante = mais gols, defensivo = menos). Match tilt = soma dos dois times.
const TILT={'Argentina':-.13,'Spain':.11,'England':-.10,'France':-.03,'Brazil':-.02,'Portugal':.05,'Germany':.57,'Colombia':-.25,'Netherlands':.19,'Uruguay':-.19,'Norway':.24,'Ecuador':-.28,'Senegal':-.34,'Japan':.06,'Italy':-.32,'Türkiye':.26,'Belgium':.23,'Switzerland':.10,'Croatia':-.01,'Paraguay':-.23,'Denmark':.10,'Morocco':-.45,'Mexico':-.22,'Austria':.23,'Canada':-.06,'Scotland':-.05,'Algeria':.09,'Australia':-.16,'Sweden':.18,'Ivory Coast':-.07,'USA':.12,'South Korea':-.20,'Poland':.16,'Egypt':-.12,'Czechia':.07,'Panama':-.04,'DR Congo':-.11,'Kosovo':.04,'Iran':-.17,'Tunisia':-.22,'Uzbekistan':-.06,'Bosnia and Herzegovina':.14,'Ghana':-.10,'South Africa':-.23,'Bolivia':.17,'Jordan':-.06,'New Zealand':-.09,'Iraq':-.19,'Saudi Arabia':-.27,'Haiti':.24,'Cape Verde':-.31,'Jamaica':-.25,'Qatar':.17,'Curaçao':.05};

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
  ['B',0,1,'12/Jun','Toronto'],['D',0,1,'12/Jun','Los Angeles'],['B',2,3,'12/Jun','Vancouver'],
  ['C',0,1,'13/Jun','Nova York/NJ'],['C',2,3,'13/Jun','Boston'],['D',2,3,'13/Jun','Vancouver'],
  ['E',0,1,'14/Jun','Houston'],['E',2,3,'14/Jun','Filadélfia'],['F',0,1,'14/Jun','Dallas'],['F',2,3,'14/Jun','Monterrey'],
  ['G',0,1,'15/Jun','Filadélfia'],['G',2,3,'15/Jun','Los Angeles'],['H',0,1,'15/Jun','Atlanta'],['H',2,3,'15/Jun','Miami'],
  ['I',0,1,'16/Jun','Nova York/NJ'],['I',2,3,'16/Jun','Boston'],['J',0,1,'16/Jun','Kansas City'],['J',2,3,'16/Jun','São Francisco'],
  ['K',0,1,'17/Jun','Houston'],['K',2,3,'17/Jun','Cidade do México'],['L',0,1,'17/Jun','Dallas'],['L',2,3,'17/Jun','Toronto'],
  ['A',3,1,'18/Jun','Atlanta'],['A',0,2,'18/Jun','Guadalajara'],['B',3,1,'18/Jun','Los Angeles'],['B',0,2,'18/Jun','Vancouver'],
  ['C',3,1,'19/Jun','Boston'],['C',0,2,'19/Jun','Filadélfia'],['D',0,2,'19/Jun','Seattle'],['D',3,1,'19/Jun','São Francisco'],
  ['E',0,2,'20/Jun','Houston'],['E',3,1,'20/Jun','Dallas'],['F',3,1,'20/Jun','Monterrey'],['F',0,2,'20/Jun','Vancouver'],
  ['G',0,2,'21/Jun','Los Angeles'],['H',0,2,'21/Jun','Atlanta'],['H',3,1,'21/Jun','Miami'],['G',3,1,'21/Jun','Vancouver'],
  ['J',0,2,'22/Jun','Dallas'],['I',0,2,'22/Jun','Filadélfia'],['I',3,1,'22/Jun','Nova York/NJ'],['J',3,1,'22/Jun','São Francisco'],
  ['K',0,2,'23/Jun','Guadalajara'],['K',3,1,'23/Jun','Cidade do México'],['L',0,2,'23/Jun','Boston'],['L',3,1,'23/Jun','Toronto'],
  ['A',3,0,'24/Jun','Cidade do México'],['A',1,2,'24/Jun','Guadalajara'],['B',3,0,'24/Jun','Vancouver'],['B',1,2,'24/Jun','Seattle'],
  ['C',3,0,'24/Jun','Miami'],['C',1,2,'24/Jun','Atlanta'],
  ['D',3,0,'25/Jun','Los Angeles'],['D',1,2,'25/Jun','São Francisco'],['E',1,2,'25/Jun','Dallas'],['E',3,0,'25/Jun','Houston'],
  ['F',1,2,'25/Jun','Monterrey'],['F',3,0,'25/Jun','Vancouver'],
  ['G',3,0,'26/Jun','Filadélfia'],['G',1,2,'26/Jun','Los Angeles'],['H',2,1,'26/Jun','Dallas'],['H',3,0,'26/Jun','Miami'],
  ['I',3,0,'26/Jun','Boston'],['I',1,2,'26/Jun','Toronto'],
  ['J',3,0,'27/Jun','Dallas'],['J',1,2,'27/Jun','Kansas City'],['K',3,0,'27/Jun','Atlanta'],['K',1,2,'27/Jun','Houston'],
  ['L',3,0,'27/Jun','Filadélfia'],['L',1,2,'27/Jun','Nova York/NJ']
];

let _ME = 1.32;
const HB = 50;
const CITY_COUNTRY = {'Los Angeles':'USA','São Francisco':'USA','Seattle':'USA','Dallas':'USA','Houston':'USA','Kansas City':'USA','Atlanta':'USA','Miami':'USA','Nova York/NJ':'USA','Boston':'USA','Filadélfia':'USA','MetLife':'USA','Cidade do México':'Mexico','Guadalajara':'Mexico','Monterrey':'Mexico','Toronto':'Canada','Vancouver':'Canada'};
const isHome = (team, city) => { const c = CITY_COUNTRY[city]; return (team === 'USA' && c === 'USA') || (team === 'Mexico' && c === 'Mexico') || (team === 'Canada' && c === 'Canada'); };
const nm = t => PT[t] || t;
const fl = t => FL[t] || '🏳️';
const DOW = d => { const [day, mon] = d.split('/'); const m = { Jun: 5, Jul: 6 }; const dt = new Date(2026, m[mon], +day); return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dt.getDay()]; };
// BRT offset by city (hours ahead of local to get BRT; BRT = UTC-3)
const TZ = {'Cidade do México':0,'Guadalajara':0,'Monterrey':0,'Toronto':-1,'Vancouver':-2,'Los Angeles':-2,'São Francisco':-2,'Seattle':-2,'Dallas':0,'Houston':0,'Kansas City':0,'Atlanta':-1,'Miami':-1,'Nova York/NJ':-1,'Boston':-1,'Filadélfia':-1,'MetLife':-1};
// Typical kickoff BRT by slot: group stage has 4 slots per day
const SLOTS = ['13:00','16:00','19:00','22:00'];
// BRT kickoff times: group stage (69 games) + knockout (match numbers 73-104)
const GS_BRT = ['16:00','23:00','16:00','22:00','01:00','19:00','22:00','16:00','14:00','20:00','17:00','23:00','16:00','22:00','13:00','19:00','16:00','19:00','22:00','01:00','14:00','23:00','17:00','20:00','13:00','22:00','16:00','19:00','19:00','22:00','16:00','01:00','14:00','17:00','01:00','14:00','16:00','13:00','19:00','22:00','14:00','18:00','21:00','00:00','14:00','23:00','17:00','20:00','22:00','22:00','16:00','16:00','19:00','19:00','23:00','23:00','17:00','17:00','20:00','20:00','16:00','00:00','21:00','21:00','16:00','16:00','23:00','23:00','20:30','20:30','18:00','18:00'];
const KO_BRT = {73:'16:00',74:'14:00',75:'17:30',76:'22:00',77:'18:00',78:'14:00',79:'22:00',80:'13:00',81:'21:00',82:'17:00',83:'20:00',84:'16:00',85:'00:00',86:'19:00',87:'22:30',88:'15:00',89:'18:00',90:'14:00',91:'17:00',92:'21:00',93:'16:00',94:'21:00',95:'13:00',96:'17:00',97:'17:00',98:'16:00',99:'18:00',100:'22:00',101:'16:00',102:'16:00',103:'18:00',104:'16:00'};

// Engine
let _rSys = 'fifa';
let _customElo = {};
let _useTilt = false; // global toggle: aplica tilt ao total de gols esperados
const rtBase = t => _rSys === 'custom' ? (_customElo[t] || ELO[t] || 1400) : _rSys === 'elo' ? (ELO[t] || 1400) : _rSys === 'bet' ? (BET[t] || 1400) : _rSys === 'pele' ? (PELE[t] || ELO[t] || 1400) : (FP[t] || 1400);
const tiltOf = t => (_useTilt && TILT[t] != null) ? TILT[t] : 0;
const matchTilt = (tA, tB) => tiltOf(tA) + tiltOf(tB); // soma dos dois times = shift no total de gols

const pp = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
// cL agora aceita tilt (soma dos 2 times) — desloca o total de gols esperados aditivamente
// Total de gols esperados = la+lb ≈ 2*_ME. Adicionamos tilt diretamente no total → shift _ME por tilt/2.
const cL = (a, b, tilt = 0) => {
  const e = 1 / (1 + Math.pow(10, -(a - b) / 400));
  const me = Math.max(0.45, Math.min(2.4, _ME + tilt * 0.5));
  return { la: Math.max(.25, Math.min(3.8, me * (.55 + .9 * e))), lb: Math.max(.25, Math.min(3.8, me * (.55 + .9 * (1 - e)))) };
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
const efCity = (t, city) => rtBase(t) + (isHome(t, city) ? HB : 0);
const rt = t => rtBase(t);
const rG = pc => { const g = {}; for (const [n, t] of Object.entries(GT)) g[n] = t.map(s => PO[s] ? PO[s].t[pc[s] || 0] : s); return g; };
const mProbs = (a, b, tA = '', tB = '') => { const { la, lb } = cL(a, b, matchTilt(tA, tB)); let pH = 0, pD = 0, pA = 0; for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const p = pp(la, i) * pp(lb, j); if (i > j) pH += p; else if (i === j) pD += p; else pA += p; } const t = pH + pD + pA; return { pH: pH / t * 100, pD: pD / t * 100, pA: pA / t * 100 }; };

const runSim = (groups, ur, fp) => {
  const tb = {};
  for (const [gn, ts] of Object.entries(groups)) ts.forEach(t => { tb[t] = { g: gn, pts: 0, gf: 0, ga: 0, gd: 0, w: 0, d: 0, l: 0 }; });
  const pos = {};

  const gm = GS.map(([gn, hi, ai, date, city], idx) => {
    const ts = groups[gn], h = ts[hi], a = ts[ai];
    const rr = ur && ur[idx];
    let gA, gB;
    if (rr && rr.gA != null && rr.gB != null) { gA = rr.gA; gB = rr.gB; }
    else { const r = sM(efCity(h, city), efCity(a, city), h, a); gA = r.gA; gB = r.gB; }
    tb[h].gf += gA; tb[h].ga += gB; tb[h].gd += gA - gB;
    tb[a].gf += gB; tb[a].ga += gA; tb[a].gd += gB - gA;
    if (gA > gB) { tb[h].pts += 3; tb[h].w++; tb[a].l++; }
    else if (gA < gB) { tb[a].pts += 3; tb[a].w++; tb[h].l++; }
    else { tb[h].pts++; tb[a].pts++; tb[h].d++; tb[a].d++; }
    return { group: gn, home: h, away: a, gA, gB, date, city, real: !!(rr && rr.gA != null), idx, brt: GS_BRT[idx] };
  });

  const st = {};
  for (const [gn, ts] of Object.entries(groups)) {
    const forced = fp && fp[gn];
    let s;
    if (forced && forced.some(Boolean)) {
      // Partial or full forced: fix positions that are set, sort rest normally
      const set = forced.filter(Boolean);
      const unset = ts.filter(t => !set.includes(t));
      const sortedUnset = unset.sort((a, b) => tb[b].pts - tb[a].pts || tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf || Math.random() - .5);
      s = [];
      let ui = 0;
      for (let i = 0; i < 4; i++) {
        if (forced[i]) s.push(forced[i]);
        else if (i < 3 && sortedUnset[ui]) s.push(sortedUnset[ui++]);
        else if (sortedUnset[ui]) s.push(sortedUnset[ui++]);
      }
      // Fill remaining
      while (s.length < 4 && ui < sortedUnset.length) s.push(sortedUnset[ui++]);
    } else {
      s = ts.slice().sort((a, b) => tb[b].pts - tb[a].pts || tb[b].gd - tb[a].gd || tb[b].gf - tb[a].gf || Math.random() - .5);
    }
    st[gn] = { sorted: s, tb: Object.fromEntries(s.map(t => [t, tb[t]])) };
    s.forEach((t, i) => { pos[t] = gn + (i + 1); });
  }

  const thirds = Object.entries(st).map(([g, { sorted }]) => ({ team: sorted[2], group: g, ...tb[sorted[2]] }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || Math.random() - .5);
  const b8 = thirds.slice(0, 8), b8g = b8.map(t => t.group).sort();
  const b8m = Object.fromEntries(b8.map(t => [t.group, t.team]));
  const asgn = solve3rd(b8g);
  const F = {}, S = {};
  for (const [g, { sorted }] of Object.entries(st)) { F[g] = sorted[0]; S[g] = sorted[1]; }

  const r32 = [];
  const mk = (h, a, mn, d, c) => { const r = sKO(ef(h), ef(a), h, a); r32.push({ home: h, away: a, ...r, winner: r.w === 'A' ? h : a, mn, date: d, city: c, ph: pos[h], pa: pos[a] }); };
  mk(S['A'], S['B'], 73, '28/Jun', 'Los Angeles');
  mk(F['E'], b8m[asgn['E']], 74, '29/Jun', 'Boston');
  mk(F['F'], S['C'], 75, '29/Jun', 'Monterrey');
  mk(F['C'], S['F'], 76, '29/Jun', 'Houston');
  mk(F['I'], b8m[asgn['I']], 77, '30/Jun', 'Nova York/NJ');
  mk(S['E'], S['I'], 78, '30/Jun', 'Dallas');
  mk(F['A'], b8m[asgn['A']], 79, '30/Jun', 'Cidade do México');
  mk(F['L'], b8m[asgn['L']], 80, '1/Jul', 'Atlanta');
  mk(F['D'], b8m[asgn['D']], 81, '1/Jul', 'Filadélfia');
  mk(F['G'], b8m[asgn['G']], 82, '1/Jul', 'Seattle');
  mk(S['K'], S['L'], 83, '2/Jul', 'Los Angeles');
  mk(F['H'], S['J'], 84, '2/Jul', 'Guadalajara');
  mk(F['B'], b8m[asgn['B']], 85, '2/Jul', 'Miami');
  mk(F['J'], S['H'], 86, '3/Jul', 'São Francisco');
  mk(F['K'], b8m[asgn['K']], 87, '3/Jul', 'Dallas');
  mk(S['D'], S['G'], 88, '3/Jul', 'Kansas City');

  const mko = (h, a, d, c, mn) => { const r = sKO(efCity(h, c), efCity(a, c), h, a); return { home: h, away: a, ...r, winner: r.w === 'A' ? h : a, date: d, city: c, mn, ph: pos[h], pa: pos[a] }; };

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
    mko(r16[2].winner, r16[3].winner, '10/Jul', 'Miami', 99),
    mko(r16[6].winner, r16[7].winner, '11/Jul', 'Kansas City', 100),
  ];

  const sf = [
    mko(qf[0].winner, qf[1].winner, '14/Jul', 'Dallas', 101),
    mko(qf[2].winner, qf[3].winner, '15/Jul', 'Atlanta', 102),
  ];
  const los = sf.map(m => m.winner === m.home ? m.away : m.home);
  const f3 = mko(los[0], los[1], '18/Jul', 'Miami', 103);
  const fin = mko(sf[0].winner, sf[1].winner, '19/Jul', 'MetLife', 104);
  return { gm, st, thirds, b8, b8g, asgn, r32, r16, qf, sf, f3, fin, tb, pos, worst3rd: b8[7] };
};

// Monte Carlo
const mkKey = (a, b) => [a, b].sort().join('|');

const runMC = (groups, n, ur, fp) => {
  const all = Object.values(groups).flat();
  const s = {};
  all.forEach(t => { s[t] = { g1: 0, g2: 0, g3a: 0, g3o: 0, g4: 0, r32: 0, r16: 0, qf: 0, sf: 0, fin: 0, ch: 0, p3: 0, p4: 0, oppR32S: 0, oppR32N: 0, oppR16S: 0, oppR16N: 0, oppQFS: 0, oppQFN: 0, oppSFS: 0, oppSFN: 0, oppFinS: 0, oppFinN: 0 }; });
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
  const gsShift = {}; // gsShift[idx] = {H:{team:cnt}, D:{team:cnt}, A:{team:cnt}, nH:0, nD:0, nA:0}
  const koShift = {}; // koShift[mn] = {[winner]:{champ:cnt, total:cnt}}

  for (let i = 0; i < n; i++) {
    const sim = runSim(groups, ur, fp);
    for (const [gn, { sorted }] of Object.entries(sim.st)) {
      s[sorted[0]].g1++; s[sorted[0]].r32++;
      s[sorted[1]].g2++; s[sorted[1]].r32++;
      // Track who finishes where
      sorted.forEach((t, pi) => {
        const pk = gn + (pi + 1);
        if (!posWho[pk]) posWho[pk] = {};
        posWho[pk][t] = (posWho[pk][t] || 0) + 1;
      });
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
  all.forEach(t => { p[t] = {}; for (const k of Object.keys(s[t])) p[t][k] = (s[t][k] / n) * 100; });
  const g3p = {};
  Object.keys(g3c).forEach(g => { g3p[g] = (g3c[g] / n) * 100; });
  const muPct = {};
  for (const rd of Object.keys(mu)) {
    muPct[rd] = Object.entries(mu[rd]).map(([k, c]) => { const [a, b] = k.split('|'); return { a, b, pct: (c / n) * 100 }; }).sort((x, y) => y.pct - x.pct);
  }
  const comboList = Object.entries(combos).map(([k, c]) => ({ key: k, pct: (c / n) * 100 })).sort((a, b) => b.pct - a.pct);
  const tmPct = {};
  all.forEach(t => {
    tmPct[t] = {};
    for (const rd of ['r32', 'r16', 'qf', 'sf', 'fin']) {
      tmPct[t][rd] = Object.entries(tm[t][rd]).map(([o, c]) => ({ o, pct: (c / n) * 100 })).sort((a, b) => b.pct - a.pct);
    }
  });
  return { p, g3p, muPct, comboList, tmPct, posMu, posTm, posWho, tmPos, posVsTm, matchTm, matchWho, matchPos, duelPos, tpc, matchByG3, matchChamp, gsShift, koShift, cutoff3rd, scoreDist };
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function WC2026() {
  const [tab, setTab] = useState('groups');
  const [nSim, setNSim] = useState(10000);
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
  const [tpcData, setTpcData] = useState(null); // position-conditioned matchups
  const [matchByG3Data, setMatchByG3Data] = useState(null); // g3-filtered match data
  const [matchChampData, setMatchChampData] = useState(null);
  const [gsShiftData, setGsShiftData] = useState(null);
  const [koShiftData, setKoShiftData] = useState(null);
  const [cutoff3rdData, setCutoff3rdData] = useState(null);
  const [scoreDistData, setScoreDistData] = useState(null);
  const [selMatch, setSelMatch] = useState(73);
  const [g3filter, setG3filter] = useState({});
  const [gamePos, setGamePos] = useState(''); // '' = all positions, 'I1' = specific position
  const [resView, setResView] = useState('games');
  const [grpView, setGrpView] = useState('');
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
  const [pc, setPc] = useState({UEFA_A:0,UEFA_B:0,UEFA_C:0,UEFA_D:0,IC1:0,IC2:0});
  const [phase, setPhase] = useState('bracket');
  const [muRound, setMuRound] = useState('r32');
  const [selTeam, setSelTeam] = useState('Brazil');
  const [muView, setMuView] = useState('round');
  const [userRes, setUserRes] = useState({});
  const [forcedPos, setForcedPos] = useState({}); // forcedPos[group] = [1st, 2nd, 3rd] or null
  const [rSys, setRSys] = useState('elo');
  const [useTilt, setUseTilt] = useState(true);
  const [customElo, setCustomElo] = useState({});
  const [customME, setCustomME] = useState(1.32);

  const groups = useMemo(() => rG(pc), [pc]);
  const all = useMemo(() => Object.values(groups).flat(), [groups]);

  const doMC = () => {
    setRunning(true);
    setTimeout(() => {
      _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt;
      const r = runMC(groups, nSim, userRes, forcedPos);
      setRes(r.p); setG3p(r.g3p); setMuPct(r.muPct); setComboList(r.comboList); setTmPct(r.tmPct); setPosMu(r.posMu); setPosTm(r.posTm); setPosWho(r.posWho); setTmPosData(r.tmPos); setPosVsTmData(r.posVsTm); setMatchTmData(r.matchTm); setMatchWhoData(r.matchWho); setMatchPosData(r.matchPos); setDuelPosData(r.duelPos); setTpcData(r.tpc); setMatchByG3Data(r.matchByG3); setMatchChampData(r.matchChamp); setGsShiftData(r.gsShift); setKoShiftData(r.koShift); setCutoff3rdData(r.cutoff3rd); setScoreDistData(r.scoreDist);
      setRunning(false); setTab('probs');
    }, 50);
  };

  const doSingle = () => { _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; setSingle(runSim(groups, userRes, forcedPos)); setTab('single'); };

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

  const nFx = Object.keys(userRes).filter(k => userRes[k]?.gA != null && userRes[k]?.gB != null).length;
  _rSys = rSys; _customElo = customElo; _ME = customME; _useTilt = useTilt; // Sync for render

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
          <div style={{ fontSize: '11px', color: dm }}>Simulando {nSim.toLocaleString()} Copas com modelo Poisson + Elo</div>
        </div>
      ) : (<>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 14px', background: '#0d1220', borderBottom: `1px solid ${bd}`, flexWrap: 'wrap' }}>
        <select value={nSim} onChange={e => setNSim(+e.target.value)} style={{ padding: '5px 8px', background: card, color: tx, border: `1px solid ${bd}`, borderRadius: '5px', fontSize: '12px' }}>
          {[1000, 5000, 10000, 25000, 50000, 100000].map(n => <option key={n} value={n}>{n.toLocaleString()}</option>)}
        </select>
        <button onClick={doMC} disabled={running} style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 700, color: '#000', background: `linear-gradient(135deg,${gd},${acc})`, border: 'none', borderRadius: '6px', cursor: running ? 'wait' : 'pointer' }}>
          {running ? '⏳...' : `▶ ${nSim.toLocaleString()}`}
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
        {nFx > 0 && <span style={{ fontSize: '10px', color: gn }}>✓ {nFx} fixo(s)</span>}
        {Object.keys(forcedPos).length > 0 && <span style={{ fontSize: '10px', color: acc }}>🔒 {Object.keys(forcedPos).length} grupo(s)</span>}
      </div>

      {/* Tabs */}
      <nav style={{ display: 'flex', gap: '1px', padding: '5px 10px', background: '#0d1220', overflowX: 'auto', borderBottom: `1px solid ${bd}` }}>
        {[['groups', '⚽ Times'], ['results', '📝 Resultados'], ['probs', '📊 Probs'], ['matchups', '🔀 Cruzam.'], ['single', '🎲 1 Copa'], ['info', 'ℹ️']].map(([id, l]) => (
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
            <div style={{ fontSize: '10px', color: dm, marginBottom: '6px' }}>Sistema: <strong style={{ color: acc }}>{rSys === 'elo' ? 'Elo (eloratings.net)' : rSys === 'bet' ? 'Apostas (implícito)' : rSys === 'pele' ? 'PELE (Silver Bulletin)' : rSys === 'custom' ? 'Custom' : 'FIFA Ranking'}</strong>{useTilt ? <span style={{ color: gd }}> • 🎯 Tilt ativo</span> : ''} • {nSim.toLocaleString()} simulações{Object.keys(forcedPos).length > 0 ? ` • 🔒 ${Object.keys(forcedPos).length} grupo(s) forçado(s)` : ''}{nFx > 0 ? ` • ✓ ${nFx} resultado(s)` : ''}</div>
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
                Object.entries(teams).forEach(([t, c]) => { cands.push({ pos, t, c: c / nSim * 100 }); });
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
                {mn:81,h:'D1',a:'3',hk:'D',hp:1,ak:thirdAssign['D']||'?',ap:3,city:'Filadelfia',third:'D'},
                {mn:82,h:'G1',a:'3',hk:'G',hp:1,ak:thirdAssign['G']||'?',ap:3,city:'Seattle',third:'G'},
                {mn:83,h:'K2',a:'L2',hk:'K',hp:2,ak:'L',ap:2,city:'Los Angeles'},
                {mn:84,h:'H1',a:'J2',hk:'H',hp:1,ak:'J',ap:2,city:'Guadalajara'},
                {mn:85,h:'B1',a:'3',hk:'B',hp:1,ak:thirdAssign['B']||'?',ap:3,city:'Miami',third:'B'},
                {mn:86,h:'J1',a:'H2',hk:'J',hp:1,ak:'H',ap:2,city:'S.Francisco'},
                {mn:87,h:'K1',a:'3',hk:'K',hp:1,ak:thirdAssign['K']||'?',ap:3,city:'Dallas',third:'K'},
                {mn:88,h:'D2',a:'G2',hk:'D',hp:2,ak:'G',ap:2,city:'Kansas City'},
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
                    <span>{label} {city}</span>
                    <span style={{ color: bl, fontFamily: 'monospace', fontWeight: 600 }}>{hPos}x{aPos}</span>
                  </div>
                  {[{t:hTeam,p:hPos},{t:aTeam,p:aPos}].map(({t,p}) => {
                    const w = t === winner;
                    const pct = matchWhoData?.[mn] ? ((matchWhoData[mn][t]||0)/nSim*100) : 0;
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
                      <div style={{ fontSize:'8px', color:dm, marginBottom:'2px' }}>Campeão mais provável</div>
                      {matchWhoData?.[104] ? Object.entries(matchWhoData[104]).sort((a,b) => (res[b[0]]?.ch||0) - (res[a[0]]?.ch||0)).slice(0,2).map(([t,c],i) => (
                        <div key={t} style={{ display:'flex', justifyContent:'center', gap:'6px', fontSize:'11px' }}>
                          <span style={{ fontWeight: i===0 ? 700 : 400, color: i===0 ? gd : tx }}>{fl(t)} {nm(t)}</span>
                          <span style={{ color: i===0 ? gd : acc, fontWeight:700 }}>{(res[t]?.ch||0).toFixed(1)}%</span>
                          <span style={{ fontSize:'8px', color:dm }}>({(c/nSim*100).toFixed(0)}% final)</span>
                        </div>
                      )) : ranked.slice(0,2).map((r,i) => (
                        <div key={r.t} style={{ display:'flex', justifyContent:'center', gap:'6px', fontSize:'11px' }}>
                          <span style={{ fontWeight: i===0 ? 700 : 400, color: i===0 ? gd : tx }}>{fl(r.t)} {nm(r.t)}</span>
                          <span style={{ color: i===0 ? gd : acc, fontWeight:700 }}>{r.ch.toFixed(1)}%</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: '8px' }}>
              {Object.entries(groups).map(([gn, ts]) => {
                const sorted = ts.slice().sort((a, b) => (res[b]?.g1 || 0) - (res[a]?.g1 || 0));
                return (
                  <div key={gn} style={crd}>
                    <div style={{ ...hdr, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Grupo {gn}</span>
                      <span style={{ fontSize: '10px', color: bl, fontWeight: 600 }}>3° avança: {(g3p?.[gn] || 0).toFixed(0)}%</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                      <thead><tr>{['Seleção', '1°', '2°', '3°✓', '3°✗', '4°', 'Avança'].map(h => (
                        <th key={h} style={{ padding: '4px 5px', textAlign: h === 'Seleção' ? 'left' : 'right', color: dm, fontSize: '9px', fontWeight: 600, borderBottom: `1px solid ${bd}` }}>{h}</th>
                      ))}</tr></thead>
                      <tbody>{sorted.map(t => {
                        const r = res[t] || {};
                        const adv = (r.g1 || 0) + (r.g2 || 0) + (r.g3a || 0);
                        return (
                          <tr key={t}>
                            <td style={{ padding: '3px 5px', fontWeight: 500 }}>{fl(t)} {nm(t)}</td>
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
                      {teamPositions2.map(([p, c]) => <option key={p} value={p}>{p} ({(c/nSim*100).toFixed(0)}%)</option>)}
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
                      items = raw.map(([t, c]) => ({ label: `${fl(t)} ${nm(t)}`, pct: (c / nSim) * 100, team: t })).sort((a,b) => b.pct - a.pct).slice(0, 20);
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
                      items = Object.entries(posTm[rd][activePos2]).map(([p, c]) => ({ label: p, pct: (c / nSim) * 100 })).sort((a, b) => b.pct - a.pct).slice(0, 20);
                      denom = items.reduce((s,x) => s + x.pct, 0);
                    } else {
                      const posD = tmPosData?.[selTeam]?.[rd] || {};
                      items = Object.entries(posD).map(([p, c]) => ({ label: p, pct: (c / nSim) * 100 })).sort((a, b) => b.pct - a.pct).slice(0, 20);
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
                        <option value="">Todas ({bestPos ? bestPos[0] + ' ' + (bestPos[1]/nSim*100).toFixed(0) + '%' : ''})</option>
                        {teamPositions.map(([p, c]) => <option key={p} value={p}>{p} ({(c/nSim*100).toFixed(0)}%)</option>)}
                      </select>
                      {activePos && posN > 0 && tpcData?.[selTeam]?.[activePos] && (
                        <span style={{ fontSize: '10px', color: gd, fontWeight: 600 }}>🏆 {((tpcData[selTeam][activePos].ch / posN) * 100).toFixed(1)}%</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '8px' }}>
                      {/* Group stage */}
                      <div style={{ background: card, borderRadius: '6px', border: `1px solid ${bd}`, padding: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: acc, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Fase de Grupos ({grpName})</span><span style={{ color: '#22c55e', fontSize: '10px' }}>{activePos ? `${(posN/nSim*100).toFixed(0)}%` : '100%'}</span>
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
                            return (tpcData[selTeam][activePos].mn[mn] || 0) / nSim * 100;
                          }
                          return matchWhoData ? (matchWhoData[mn]?.[selTeam] || 0) / nSim * 100 : 0;
                        };
                        const posPct = activePos ? (posN / nSim) * 100 : 100;
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
                    const hint = best ? ` — ${nm(best[0])} ${(best[1]/nSim*100).toFixed(0)}%` : '';
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
                      return { k, pct: (c / nSim) * 100, t1, t2 };
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
                          Mais provável: {best3.map(([t,c]) => `${fl(t)}${nm(t)} ${(c/nSim*100).toFixed(0)}%`).join(', ')}
                          {tpcData && (() => {
                            let chTotal = 0;
                            best3.forEach(([t]) => { if (tpcData[t]?.[selPos]) chTotal += tpcData[t][selPos].ch; });
                            return chTotal > 0 ? <span style={{ color: gd, marginLeft: '6px' }}>🏆 {(chTotal/nSim*100).toFixed(1)}%</span> : null;
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
                          return { label: opp, hint: oppBest ? `${fl(oppBest)}${nm(oppBest)}` : '', pct: (c / nSim) * 100 };
                        }).sort((a, b) => b.pct - a.pct);
                      } else {
                        const d = posVsTmData?.[rd]?.[selPos] || {};
                        items = Object.entries(d).map(([t, c]) => ({ label: `${fl(t)} ${nm(t)}`, hint: '', pct: (c / nSim) * 100 })).sort((a, b) => b.pct - a.pct);
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
                return <>
                  {g3ins.length + g3outs.length > 0 && <div style={{ fontSize: '10px', color: bl, marginBottom: '4px' }}>{filtered.length} combinações ({totalPct.toFixed(1)}% das simulações)</div>}
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
                </>;
              })()}
            </>)}

            {muView === 'venue' && matchTmData && (() => {
              const MATCHES = [
                [73,'28/Jun','Los Angeles','2A×2B','R32'],[74,'29/Jun','Boston','1E×3°','R32'],[75,'29/Jun','Monterrey','1F×2C','R32'],[76,'29/Jun','Houston','1C×2F','R32'],
                [77,'30/Jun','Nova York/NJ','1I×3°','R32'],[78,'30/Jun','Dallas','2E×2I','R32'],[79,'30/Jun','Cd. México','1A×3°','R32'],[80,'1/Jul','Atlanta','1L×3°','R32'],
                [81,'1/Jul','Filadélfia','1D×3°','R32'],[82,'1/Jul','Seattle','1G×3°','R32'],[83,'2/Jul','Los Angeles','2K×2L','R32'],[84,'2/Jul','Guadalajara','1H×2J','R32'],
                [85,'2/Jul','Miami','1B×3°','R32'],[86,'3/Jul','S. Francisco','1J×2H','R32'],[87,'3/Jul','Dallas','1K×3°','R32'],[88,'3/Jul','Kansas City','2D×2G','R32'],
                [89,'4/Jul','Filadélfia','W74×W77','R16'],[90,'4/Jul','Houston','W73×W75','R16'],[91,'5/Jul','Nova York/NJ','W76×W78','R16'],[92,'5/Jul','Cd. México','W79×W80','R16'],
                [93,'6/Jul','Dallas','W83×W84','R16'],[94,'6/Jul','Seattle','W81×W82','R16'],[95,'7/Jul','Atlanta','W86×W88','R16'],[96,'7/Jul','Vancouver','W85×W87','R16'],
                [97,'9/Jul','Boston','W89×W90','QF'],[98,'10/Jul','Los Angeles','W93×W94','QF'],[99,'10/Jul','Miami','W91×W92','QF'],[100,'11/Jul','Kansas City','W95×W96','QF'],
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
              const positions = matchPosData?.[mn] ? Object.entries(matchPosData[mn]).map(([k, c]) => ({ k, pct: (c / nSim) * 100 })).sort((a, b) => b.pct - a.pct) : [];

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
                    <span style={{ fontSize: '11px', color: dm }}>{DOW(date)} {date} • {city}</span>
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
                return { mn: idx + 1, date, city, brt: GS_BRT[idx], phase: 'Grupos', avgElo: avg, top: `${fl(h)}${nm(h)} vs ${fl(a)}${nm(a)}`, champ: matchChampData?.[idx+1] ? (matchChampData[idx+1] / nSim * 100) : 0, struct: `G${gn}`, shift: computeGsShift(idx) };
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
                const champ = matchChampData?.[mn] ? (matchChampData[mn] / nSim * 100) : 0;
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
                          return { posA, posB, c, pct: c / nSim * 100 };
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
          </div>
        )}
        {tab === 'results' && (
          <div style={cs}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px', color: acc }}>📝 Resultados & Probabilidades</div>
            <div style={{ fontSize: '10px', color: dm, marginBottom: '8px' }}>{nFx} de {GS.length} preenchidos. Preencha e rode a simulação.</div>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <SB active={resView === 'games'} onClick={() => setResView('games')}>⚽ Jogos</SB>
              <SB active={resView === 'standings'} onClick={() => setResView('standings')}>📊 Classificação</SB>
              <SB active={resView === 'forced'} onClick={() => setResView('forced')}>🔒 Forçar</SB>
              {nFx > 0 && <button onClick={() => setUserRes({})} style={{ padding: '3px 8px', fontSize: '9px', color: '#ef4444', background: 'transparent', border: '1px solid #ef444444', borderRadius: '3px', cursor: 'pointer', marginLeft: '8px' }}>Limpar resultados</button>}
            </div>

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

            {/* Force group positions */}
            {resView === 'forced' && <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: acc, marginBottom: '6px' }}>🔒 Forçar classificação (opcional)</div>
              <div style={{ fontSize: '10px', color: dm, marginBottom: '8px' }}>Defina 1°, 2° e 3° de cada grupo. O MC usará essas posições como fixas.</div>
              {Object.keys(forcedPos).length > 0 && <button onClick={() => setForcedPos({})} style={{ padding: '3px 8px', fontSize: '9px', color: '#ef4444', background: 'transparent', border: '1px solid #ef444444', borderRadius: '3px', cursor: 'pointer', marginBottom: '8px' }}>Limpar forçados</button>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '6px' }}>
                {Object.entries(groups).map(([gn, ts]) => {
                  const fp = forcedPos[gn] || [];
                  const setGP = (pos, val) => {
                    setForcedPos(prev => {
                      const cur = [...(prev[gn] || [null, null, null])];
                      // Clear this team from other positions in this group
                      if (val) cur.forEach((v, i) => { if (v === val && i !== pos) cur[i] = null; });
                      cur[pos] = val || null;
                      // If all null, remove the group
                      if (cur.every(v => !v)) { const n = { ...prev }; delete n[gn]; return n; }
                      return { ...prev, [gn]: cur };
                    });
                  };
                  return (
                    <div key={gn} style={{ background: card, borderRadius: '5px', border: `1px solid ${fp.some(Boolean) ? acc + '44' : bd}`, padding: '6px 8px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>Grupo {gn}</div>
                      {[0, 1, 2].map(p => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '9px', color: dm, width: '16px' }}>{p + 1}°</span>
                          <select value={fp[p] || ''} onChange={e => setGP(p, e.target.value)} style={{ flex: 1, padding: '2px 4px', background: '#0d111d', color: fp[p] ? acc : dm, border: `1px solid ${bd}`, borderRadius: '3px', fontSize: '11px' }}>
                            <option value="">—</option>
                            {ts.map(t => <option key={t} value={t}>{fl(t)} {nm(t)}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>}

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
                    const pr = mProbs(efCity(m.home, m.city), efCity(m.away, m.city), m.home, m.away);
                    const fx = userRes[m.idx];
                    const hasFx = fx?.gA != null && fx?.gB != null;
                    return (
                      <div key={m.idx} style={{ background: card, borderRadius: '5px', padding: '6px 10px', marginBottom: '3px', border: `1px solid ${hasFx ? gn + '44' : bd}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '9px', color: dm }}>G{m.gn} • {GS_BRT[m.idx]} BRT • {m.city}</span>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
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

        {/* INFO */}
        {tab === 'info' && (
          <div style={{ ...cs, maxWidth: '700px' }}>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: gd, margin: '0 0 10px', fontSize: '15px' }}>Como usar o simulador</h3>
              <p style={{ color: tx }}><strong style={{ color: acc }}>a) Simule milhares de Copas.</strong> Rode 1.000 a 100.000 simulações Monte Carlo usando diferentes sistemas de rating (Elo, FIFA Ranking, Odds implícitas ou valores customizados). Ajuste o fator de gols esperados para calibrar o modelo.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>b) Explore cruzamentos.</strong> Com base nas simulações, descubra quais times, posições e jogos se cruzam em cada fase. Filtre por posição no grupo para ver cenários condicionais — ex: "se o Brasil terminar em 2° no grupo, quem ele enfrenta nas oitavas?"</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>c) Identifique os jogos mais interessantes.</strong> A aba Elo Jogos ranqueia todos os 104 jogos por qualidade (Elo), importância para o título (Champion Stake e Title Shift) e equilíbrio. Um score composto de Interesse destaca os top 10 jogos da fase de grupos.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>d) Acompanhe a Copa em tempo real.</strong> Preencha resultados reais na aba Resultados e force classificações nos grupos. Rode a simulação novamente e veja como as probabilidades evoluem jogo a jogo. Cada resultado atualiza o bracket, as chances de título e os cruzamentos.</p>
              <p style={{ color: tx }}><strong style={{ color: acc }}>e) Simule uma Copa específica.</strong> Use "Simular 1 Copa" para gerar um torneio completo com bracket, placares e campeão — um destino possível entre milhares.</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: acc, margin: '0 0 10px', fontSize: '14px' }}>Critérios da Simulação</h3>
              <p><strong style={{ color: tx }}>Modelo de gols:</strong> Distribuição de Poisson independente para cada time. A taxa esperada de gols (λ) de cada time depende da diferença de rating entre os dois times via fórmula logística. Com o fator padrão de 1.32, dois times iguais produzem ~2.6 gols/jogo no total. Ajustável na aba Times.</p>
              <p><strong style={{ color: tx }}>Vantagem de mandante:</strong> +{HB} pontos de rating aplicados quando EUA, México ou Canadá jogam em cidade do seu próprio país. Mapeamento de 17 sedes para o país correspondente. Times que jogam fora do seu país não recebem bônus, mesmo como mandantes no papel.</p>
              <p><strong style={{ color: tx }}>Fase de grupos:</strong> Cada jogo simulado via Poisson. Classificação por pontos, saldo de gols, gols marcados e sorteio. Os 2 primeiros de cada grupo avançam. Os 8 melhores 3°s avançam via Anexo C da FIFA (495 combinações pré-codificadas).</p>
              <p><strong style={{ color: tx }}>Mata-mata (90min):</strong> Simulado via Poisson com os mesmos parâmetros. Em caso de empate, prorrogação simulada com λ reduzido a 33% (~30min). Se ainda empatado, pênaltis com probabilidade base 50/50 + pequeno ajuste por diferença de rating (Δ/4000).</p>
              <p><strong style={{ color: tx }}>Seleção dos 8 melhores 3°s:</strong> Em cada simulação, os 12 terceiros colocados são ranqueados por pontos, saldo e gols. Os 8 melhores avançam e são alocados nos R32 conforme a combinação correspondente do Anexo C da FIFA — que determina qual 3° enfrenta qual 1° de grupo.</p>
              <p><strong style={{ color: tx }}>Bracket probabilístico:</strong> Na aba Probs/Bracket, o time mais provável de cada posição é atribuído via greedy dedup (cada time aparece uma vez). O mata-mata é traçado com base nos dados do Monte Carlo — o time com maior probabilidade de avançar é selecionado.</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm, marginBottom: '12px' }}>
              <h3 style={{ color: acc, margin: '0 0 10px', fontSize: '14px' }}>Sensibilidade Elo → Probabilidade</h3>
              <p style={{ marginBottom: '8px' }}>A tabela mostra como a diferença de Elo entre dois times afeta as probabilidades de vitória, empate e derrota no modelo Poisson (fase de grupos, sem vantagem de mando).</p>
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
              <p style={{ fontSize: '9px', marginTop: '6px' }}>ΔElo = diferença favorável. Máximo do torneio: Espanha (2165) vs Qatar (1425) = Δ740. Gols Fav/Con = λ esperados por time (Poisson). Com gols/jogo = {(_ME * 2).toFixed(1)}.{useTilt ? ' • Tilt ON: gols totais por jogo são deslocados pela soma dos tilts dos dois times (rangem aprox. de –0.8 a +1.0).' : ''}</p>
            </div>
            <div style={{ background: card, borderRadius: '8px', padding: '14px', border: `1px solid ${bd}`, fontSize: '11px', lineHeight: 1.8, color: dm }}>
              <h3 style={{ color: acc, margin: '0 0 8px', fontSize: '14px' }}>Modelo & Bracket</h3>
              <p><strong style={{ color: tx }}>Ratings:</strong> (1) FIFA Ranking 19/Jan/2026, (2) Elo eloratings.net 1/Abr/2026, (3) Apostas — Elo implícito, (4) <strong style={{ color: acc }}>PELE — Silver Bulletin</strong> (qualidade ofensiva/defensiva agregada, escala calibrada similar ao Elo), (5) Custom — edite manualmente na aba Times. Vantagem de +{HB}pts aplicada quando EUA/México/Canadá jogam em seu próprio país.</p>
              <p><strong style={{ color: tx }}>🎯 Tilt:</strong> Toggle independente que pode ser combinado com qualquer rating. Cada seleção tem um tilt (–.45 a +.57 nos dados disponíveis) que reflete se seus jogos costumam ter mais gols (atacante) ou menos (defensivo). O tilt da partida = soma dos tilts dos dois times, e é adicionado ao total de gols esperados (Ger +.57 vs Mar –.45 → match tilt +.12, ~+0.12 gols). Distribuído proporcionalmente entre os times conforme o Elo. Todas 54 seleções do simulador têm tilt fornecido.</p>
              <p><strong style={{ color: tx }}>PELE:</strong> 79 seleções fornecidas pelo usuário (75 + Catar/Cabo Verde/Curaçao/Jamaica). Cobertura completa das 54 seleções do simulador.</p>
              <p><strong style={{ color: tx }}>R32:</strong> M73(2A×2B) M74(1E×3°) M75(1F×2C) M76(1C×2F) M77(1I×3°) M78(2E×2I) M79(1A×3°) M80(1L×3°) M81(1D×3°) M82(1G×3°) M83(2K×2L) M84(1H×2J) M85(1B×3°) M86(1J×2H) M87(1K×3°) M88(2D×2G)</p>
              <p><strong style={{ color: tx }}>R16:</strong> M89(W74×W77) M90(W73×W75) M91(W76×W78) M92(W79×W80) M93(W83×W84) M94(W81×W82) M95(W86×W88) M96(W85×W87)</p>
              <p><strong style={{ color: tx }}>QF:</strong> M97(W89×W90) M98(W93×W94) M99(W91×W92) M100(W95×W96)</p>
              <p><strong style={{ color: tx }}>SF:</strong> M101(W97×W98) Pathway 1 | M102(W99×W100) Pathway 2</p>
              <p><strong style={{ color: tx }}>Pools 3°:</strong> 1A(CEFHI) 1B(EFGIJ) 1D(BEFIJ) 1E(ABCDF) 1G(AEHIJ) 1I(CDFGH) 1K(DEIJL) 1L(EHIJK). <strong>Todas as 495 combinações</strong> do Anexo C do regulamento FIFA estão codificadas — lookup O(1), sem solver.</p>
              <p><strong style={{ color: tx }}>Resultados:</strong> Aba 📝 permite fixar placares reais manualmente ou via arquivo JSON. Monte Carlo respeita resultados fixados e classificações forçadas. Formato JSON aceito: <code style={{ color: bl, fontSize: '9px' }}>[{"{"}match:1, gA:2, gB:1{"}"}, ...]</code> onde match = número do jogo (1-72), ou <code style={{ color: bl, fontSize: '9px' }}>[{"{"}home:"Brazil", away:"Morocco", gA:2, gB:1{"}"}, ...]</code> com nomes dos times.</p>
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
        <div style={{ marginTop: '4px', color: acc }}>henrique.noronha • 8/mai/2026</div>
      </footer>
    </div>
  );
}
