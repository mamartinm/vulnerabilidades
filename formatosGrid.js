defaultFormatter = function(cellvalue, options, rowObject) {
    if (cellvalue == null || cellvalue.length == 0 || jQuery.trim(cellvalue) == "") {
        cellvalue = "&nbsp;";
    } else {
        cellvalue = cellvalue;
    }
    return cellvalue;
}

clalfFormatter = function(cellvalue, options, rowObject) {
    if (cellvalue == null || cellvalue.length == 0 || jQuery.trim(cellvalue) == "") {
        cellvalue = "&nbsp;";
    } else {
        if (jQuery.trim(cellvalue).length == 13) {
            var clalf = cellvalue.substr(1, 10);
            while (clalf != "") {
                if (clalf.charAt(0) == "0") {
                    clalf = clalf.substring(1);
                }
                else if (clalf.charAt(clalf.length - 1) == " ") {
                    clalf = clalf.substring(0, clalf.length - 1);
                }
                else {
                    break;
                }
            }
            cellvalue = clalf;
        }
    }
    return cellvalue;
}

imgCheckFormatter = function(cellvalue, options, rowObject) {
    return (leerBooleano(cellvalue) == true) ? "<img src='images/arco/tick.gif' title='" + options.colModel.formatoptions.altTrue + "' />" : "<img src='images/arco/cross.gif' title='" + options.colModel.formatoptions.altFalse + "' />";
}

imgCheckNullFormatter = function (cellvalue, options, rowObject) {
    if (cellvalue == '') {
        return "&nbsp;"
    }
    else {
        return (leerBooleano(cellvalue) == true) ? "<img src='images/arco/tick.gif' title='" + options.colModel.formatoptions.altTrue + "' />" : "<img src='images/arco/cross.gif' title='" + options.colModel.formatoptions.altFalse + "' />";
    }
}

otrasDemandasFormatter = function(cellvalue, options, rowObject) {
    return (leerBooleano(cellvalue) == true) ? "<img src='images/aviso_mini.png' title='Interviniente relacionado con otras demandas / Otras deudas no reclamadas' />" : "&nbsp;";
}

otrosExpedientesFormatter = function(cellvalue, options, rowObject) {
    return (leerBooleano(cellvalue) == true) ? "<img src='images/aviso_mini.png' title='Interviniente relacionado con otros expedientes / Otras deudas no reclamadas' />" : "&nbsp;";
}

formatterTextoCorto = function(cellvalue, options, rowObject) {
    var LongCort = 60;
    var texto = "";

    if (cellvalue != undefined) {
        if (cellvalue.indexOf("\n") > -1 && cellvalue.indexOf("\n") <= LongCort) {
            //Texto con saltos de línea
            texto = cellvalue.substring(0, cellvalue.indexOf("\n"));
            texto = texto + '...';
        }
        else {
            texto = cellvalue;
            if (texto.length > LongCort) {
                texto = texto.substring(0, LongCort);
                texto = texto + '...';
            }
        }
        if (texto.length <= 0) {
            texto = "&nbsp;"
        }
    }
    else
    {
        texto = "&nbsp;"
    }

    return cellvalue = texto;
}

formatterTextoLargo = function(cellvalue, options, rowObject) {
    return "<pre>" + cellvalue + "</pre>";
}


