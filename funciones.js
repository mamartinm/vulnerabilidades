var LEN = '\x85';
var SESSIONERROR = "SessionError";
var TPNETFILE = "C:/tpnet/secuencia.txt";
var debug = false;

var URL_LOGON = "";

var SCR_UPLOAD_WINDOW = "cmn_carga_ventana.asp";
var SCR_UPLOAD = "cmn_carga.asp";

function supportsActiveX() {
    try {
        return !!new ActiveXObject("htmlfile");
    } catch (e) {
        return false;
    }
}

function obtenerFecha() {
    var now = new Date();
    var strNow =
        (((now.getDate()) < 10) ? "0" + now.getDate() : now.getDate()) + "/" +
        (((now.getMonth() + 1) < 10) ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1)) + "/" +
        now.getFullYear()

    return strNow;
}

function esBisiesto(anio) {
    var iAnnio = parseInt(anio);
    if (iAnnio % 4 == 0) {
        if (iAnnio % 100 == 0) {
            if (iAnnio % 400 == 0) {
                return true;
            }
        }
        else {
            return true;
        }
    }

    return false;
}

function validarFecha(campo) {
    var field = document.getElementById(campo.name);

    if (field.value != "") {
        var fecha = new String(field.value);

        // Para sacar la fecha de hoy
        var formatoCorrecto = true;
        var realFecha = new Date();
        var ano = null;
        var mes = null;
        var dia = null;

        var fBits = fecha.split("/");
        if (fBits.length != 3) {
            fBits = fecha.split("-");
            if (fBits.length != 3) {
                formatoCorrecto = false;
            }
        }

        if (formatoCorrecto == true) {
            if (fBits[0].length == 4 && fBits[1].length == 2 && fBits[2].length == 2) {
                //Formato AAAA/MM/DD
                ano = fBits[0];
                mes = fBits[1];
                dia = fBits[2];
            }
            else if (fBits[0].length == 2 && fBits[1].length == 2 && fBits[2].length == 4) {
                //Formato DD/MM/AAAA
                ano = fBits[2];
                mes = fBits[1];
                dia = fBits[0];
            }
            else {
                formatoCorrecto = false;
            }
        }

        var mensaje = "";
        var resultado = true;

        if (formatoCorrecto == false) {
            mensaje = "Formato de fecha incorrecto. DD/MM/AAAA - AAAA/MM/DD";
            resultado = false;
        }
        else if (isNaN(ano) || ano.length < 4 || parseFloat(ano) < 1900) {
            // Valido el año
            mensaje = "Año inválido";
            resultado = false;
        }
        else if (isNaN(mes) || parseFloat(mes) < 1 || parseFloat(mes) > 12) {
            // Valido el mes
            mensaje = "Mes inválido";
            resultado = false;
        }
        else if (isNaN(dia) || parseInt(dia, 10) < 1 || parseInt(dia, 10) > 31) {
            // Valido el día  
            mensaje = "Día inválido";
            resultado = false;
        }
        else if (mes == 4 || mes == 6 || mes == 9 || mes == 11) {
            if (dia > 30) {
                mensaje = "Día inválido";
                resultado = false;
            }
        }
        else if (mes == 2) {
            //Año bisiesto
            if (esBisiesto(ano)) {
                if (parseInt(dia) > 29) {
                    mensaje = "Día inválido";
                    resultado = false;
                }
            }
            else {
                if (parseInt(dia) > 28) {
                    mensaje = "Día inválido.";
                    resultado = false;
                }
            }
        }

        if (resultado == false) {
            abrirPantallaAviso("Atención", mensaje, "0");
            field.focus();
        }

        return resultado;
    }
}

function leerBooleano(value) {
    if (value == undefined) {
        return undefined;
    }
    else {
        if (value == true || value == "true" || value == "True") {
            return true;
        }
        else {
            return false;
        }
    }
}

function leerImporte(value) {
    var importe = $("<input />");
    importe.val(value);
    importe.toNumber();
    return importe.val();
}

function numeroDecimal(campo, decimales) {
    var ctrl = undefined;
    if (campo.val) {
        ctrl = campo;
    }
    else {
        ctrl = $("#" + campo.name);
    }

    if (ctrl) {
        var valor = ctrl.val();
        if (valor != "") {
            if (isNaN(parseFloat(valor).toFixed(decimales))) {
                abrirPantallaAviso("Atención", "El dato introducido no es un número válido", "0");
                ctrl.focus();
            } else {
                ctrl.val(parseFloat(valor.replace(",", ".")).toFixed(decimales).replace(".", ","));
            }
        }
    }
}

function valorDecimal(valor, decimales) {
    if (valor != "") {
        if (isNaN(parseFloat(valor).toFixed(decimales))) {
            abrirPantallaAviso("Atención", "El dato introducido no es un número válido", "0");
        } else {
            return parseFloat(valor.replace(",", ".")).toFixed(decimales).replace(".", ",");
        }
    }
}

function obtenerDatosSigno(conexion, clave, titulo) {

    var correcto = false;
    var terminal = null;
    var oficina = null;
    var nombreOficina = null;
    var secuencia = null;

    if (debug == true) {
        correcto = true;
        terminal = "1";
        oficina = "1";
        nombreOficina = "PRUEBAS";
        secuencia = "1";
    }
    else {
        if (supportsActiveX() || window.ActiveXObject) {
            try {
                var obj = new ActiveXObject("SrvTP101.CSignoCom");

                try {
                    obj.InicializarCom(conexion, clave, titulo);

                    terminal = obj.InfoUsuario(0);
                    oficina = obj.InfoUsuario(1);
                    nombreOficina = obj.InfoUsuario(2);

                    correcto = (terminal != null && terminal != "");
                }
                catch (e) {
                    abrirPantallaAviso("Error", "MSG_ENo se pudo iniciar la conexion con ARCO.\n\n" + e.message, "0");
                }
                finally {
                    obj.FinalizarCom();
                    obj = null;
                }
            }
            catch (e) {
                return {
                    correcto: true,
                    terminal: null,
                    oficina: null,
                    nombreOficina: null,
                    secuencia: null
                };
            }
        }
        else {
            abrirPantallaAviso("Error", "MSG_EEl explorador no permite instanciar objetos COM", "0");
            //return {
            //    correcto: true,
            //    terminal: null,
            //    oficina: null,
            //    nombreOficina: null,
            //    secuencia: null
            //};
        }

        if (correcto == true) {
            //Leer el fichero de secuencia
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            if (fso.FileExists(TPNETFILE)) //si existe 
            {
                var ageneral = fso.OpenTextFile(TPNETFILE, 1, true); //se abre el archivo
                try {
                    var linea = ageneral.ReadLine(); //leo sólo la primera linea

                    //Coger las 4 primeras posiciones
                    if (linea.length > 4) {
                        secuencia = linea.substring(0, 4);
                    }
                }
                finally {
                    ageneral.Close(); //cierra fichero
                    ageneral = null;
                }
            }
            else {
                abrirPantallaAviso("Error", "MSG_EEl fichero de secuencia no existe y por lo tanto no se puede imputar cobros/gastos.", "0");
            }
        }
    }

    return {
        correcto: correcto,
        terminal: terminal,
        oficina: oficina,
        nombreOficina: nombreOficina,
        secuencia: secuencia
    };
}

function lanzarMonitoria(conexion, clave, titulo, buffer) {
    var resTrn = false;
    var msg = null;

    if (debug == true) {
        resTrn = true;
        msg = "Ejecución en Modo DEBUG. No se lanza monitoría";
    }
    else {
        if (supportsActiveX() || window.ActiveXObject) {
            try {
                var obj = new ActiveXObject("SrvTP101.CSignoCom");
                try {
                    obj.InicializarCom(conexion, clave, titulo);

                    //Lanzar la monitoría
                    if (obj.LanzarMonitoriaTrn(buffer, true)) {
                        resTrn = true;
                    }
                    else {
                        msg = "Error lanzando monitoría";
                    }
                }
                catch (e) {
                    msg = "No se pudo iniciar la conexión.\n\n" + e.message;
                }
                finally {
                    obj.FinalizarCom();
                    obj = null;
                }
            }
            catch (e) {
                msg = "Error lanzando monitoría. No se permite imputar cobros/gastos desde un entorno distinto de ARCO.\n\n" + e.message;
            }
        }
        else {
            msg = "El explorador no permite instanciar objetos COM";
        }
    }

    if (msg != null && msg != "") {
        abrirPantallaAviso("Error", "MSG_E" + msg, 0);
    }

    return resTrn;
}

function abrirARCO(conexion, clave, titulo, accion, buffer) {
    var resTrn = false;

    if (debug == true) {
        //Ejecución en Modo DEBUG. No se lanza monitoría
        resTrn = false;
    }
    else {
        if (supportsActiveX() || window.ActiveXObject) {
            try {
                var obj = new ActiveXObject("SrvTP101.CSignoCom");
                try {
                    obj.InicializarCom(conexion, clave, titulo);

                    //Lanzar la monitoría
                    if (obj.LanzarActividadSincrona2(accion, buffer, "")) {
                        resTrn = true;
                    }
                    else {
                        //Error lanzando monitoría
                        resTrn = false;
                    }
                }
                catch (e) {
                    //No se pudo iniciar la conexión.
                    resTrn = false;
                }
                finally {
                    obj.FinalizarCom();
                    obj = null;
                }
            }
            catch (e) {
                //Error lanzando monitoría. No se permite el acceso desde un entorno distinto de ARCO
                resTrn = false;
            }
        }
        else {
            //El explorador no permite instanciar objetos COM"
            resTrn = false;
        }
    }

    return resTrn;
}

function lanzarImpresion(conexion, clave, titulo, bufferImpresion) {
    var resTrn = false;
    var msg = null;

    if (debug == true) {
        resTrn = true;
        msg = "Ejecución en Modo DEBUG. No se lanza impresión";
    }
    else {
        if (supportsActiveX() || window.ActiveXObject) {
            try {
                var obj = new ActiveXObject("SrvTP101.CSignoCom");
                try {
                    obj.InicializarCom(conexion, clave, titulo);

                    //Lanzar la monitoría
                    obj.LanzarImpresion(bufferImpresion);
                }
                catch (e) {
                    msg = "No se pudo iniciar la conexión.\n\n" + e.message;
                }
                finally {
                    obj.FinalizarCom();
                    obj = null;
                }
            }
            catch (e) {
                msg = "Error lanzando impresión. No se permite realizar impresión de boletas desde un entorno distinto de ARCO.\n\n" + e.message;
            }
        }
        else {
            msg = "El explorador no permite instanciar objetos COM";
        }
    }

    if (msg != null && msg != "") {
        abrirPantallaAviso("Error", "MSG_E" + msg, 0);
    }

    return resTrn;
}

function getMessage(texto) {
    var tipoInformacion = "MSG_I";
    var tipoWarning = "MSG_W";
    var tipoError = "MSG_E";
    var tipoQuestion = "MSG_Q";

    if (texto.indexOf(tipoInformacion) != -1) {
        texto = texto.slice(tipoInformacion.length);
    }
    else if (texto.indexOf(tipoWarning) != -1) {
        texto = texto.slice(tipoWarning.length);
    }
    else if (texto.indexOf(tipoError) != -1) {
        texto = texto.slice(tipoError.length);
    }
    else if (texto.indexOf(tipoQuestion) != -1) {
        texto = texto.slice(tipoQuestion.length);
    }

    return texto
}

function abrirPantallaAviso(titulo, texto, tipo) {
    var ret;

    if (!isIE()) {
        if (window.confirm(titulo + "\n\n" + getMessage(texto))) {
            ret = "1";
        } else {
            ret = "0";
        }
    } else {
        ret = window.showModalDialog("pantalla_avisos.asp", [titulo, texto, tipo], "dialogHeight:250px; dialogWidth: 650px; edge: none; center: yes; help: no; resizable: no; status: no; scroll: no; ");
    }

    return ret;
}

function abrirPantallaEnlaces(titulo, texto, codigoCON03, codigoCON04) {
    if (!isIE()) {
        if (window.confirm(titulo + "\n\n" + texto + " MON - DEC")) {
            ret = "1";
        } else {
            ret = "0";
        }
    }
    else {
        return window.showModalDialog("pantalla_avisos_enlace.asp", [titulo, texto, codigoCON03, codigoCON04], "dialogHeight:250px; dialogWidth:650px; edge: Raised; center: yes; help: no; resizable: no; status: no; scroll: no; ");
    }
}

function cargarCombo(combo, xml, incluirBlanco, seleccionarPorDefecto, textoBlanco) {
    if (combo) {
        //Limpiar contenido
        limpiarCombo(combo, incluirBlanco, textoBlanco);

        var elementos = $(xml).find("Filas");
        $(elementos).find("Fila").each(function () {
            var clave = $(this).find("Clave").text();
            var descripcion = $(this).find("Valor").text();
            var seleccionado = "";
            if (seleccionarPorDefecto == true) {
                var porDefecto = $(this).find("PorDefecto").textBoolean();
                if (porDefecto == true) {
                    seleccionado = "selected";
                }
            }

            $(combo).append("<option title='" + descripcion + "' value='" + clave + "' " + seleccionado + ">" + descripcion + "</option>");
        });
    }
}

function cargarComboValor(combo, xml, incluirBlanco) {
    if (combo) {
        //Limpiar contenido
        limpiarCombo(combo, incluirBlanco);

        var elementos = $(xml).find("Filas");
        $(elementos).find("Fila").each(function () {
            var clave = $(this).find("Clave").text();
            var descripcion = $(this).find("Valor").text();
            $(combo).append("<option title='" + descripcion + "' value='" + clave + "'>" + clave + "-" + descripcion + "</option>");
        });
    }
}

function limpiarCombo(combo, incluirBlanco, textoBlanco) {
    $(combo).find("option").remove().end();
    if (incluirBlanco) {
        if (textoBlanco) {
            $(combo).append("<option value=''>" + textoBlanco + "</option>");
        }
        else {
            $(combo).append("<option value=''></option>");
        }
    }
}

function cargaLetrados(comboLetrados, soloActivos, callBack) {
    if ($(comboLetrados).find("option").length <= 2) {
        lanzarAjaxXML(
            "include/Maestros.asp",
            {
                funcion: "RecargarMaestroLetrados",
                soloActivos: soloActivos
            },
            function (xml) {
                cargarCombo($(comboLetrados), xml, true);
                if (callBack) {
                    callBack.call(this);
                }
            },
            function (error) {
                if (error != "") {
                    abrirPantallaAviso("Atención", error, "0");
                }
            });
    }
    else {
        if (callBack) {
            callBack.call(this);
        }
    }
}

function cargaProcuradores(comboProcuradores, soloActivos, callBack) {
    if ($(comboProcuradores).find("option").length <= 2) {
        lanzarAjaxXML(
            "include/Maestros.asp",
            {
                funcion: "RecargarMaestroProcuradores",
                soloActivos: soloActivos
            },
            function (xml) {
                cargarCombo($(comboProcuradores), xml, true);
                if (callBack) {
                    callBack.call(this);
                }
            },
            function (error) {
                if (error != "") {
                    abrirPantallaAviso("Atención", error, "0");
                }
            });
    }
    else {
        if (callBack) {
            callBack.call(this);
        }
    }
}

function lanzarAjaxHTML(url, parameters, successCallback, errorCallback, async) {
    if (async == undefined) {
        async = false;
    }
    lanzarAjax(url, "html", async, parameters, successCallback, errorCallback);
}

function lanzarAjaxXML(url, parameters, successCallback, errorCallback, async) {
    if (async == undefined) {
        async = true;
    }
    lanzarAjax(url, "xml", async, parameters, successCallback, errorCallback);
}

function lanzarAjax(url, dataType, async, parameters, successCallback, errorCallback) {

    showOverlay("loading1", "loading", "loading_content");

    $.ajax({
        url: url,
        type: "POST",
        data: $.extend({}, parameters, { CSRFToken: csrfToken }),
        dataType: dataType,
        async: async,
        cache: false,
        success: function (data, textStatus, jqXHR) {
            hideOverlay("loading1");

            if (textStatus == "success") {
                if (dataType.toUpperCase() == "XML") {

                    if (jqXHR.responseXML) {
                        showResponseMessages(jqXHR.responseXML);
                    } else if (jqXHR.responseText && jqXHR.responseText != "") {
                        abrirPantallaAviso("Atención", jqXHR.responseText, "0");
                    }

                    if (successCallback) {
                        successCallback.call(this, jqXHR.responseXML);
                    }
                }
                else {
                    if (successCallback) {
                        successCallback.call(this, jqXHR.responseText);
                    }
                }
            }
            else {
                if (dataType.toUpperCase() == "XML") {
                    if (jqXHR.responseXML) {
                        showResponseMessages(jqXHR.responseXML && jqXHR.responseText != "");
                    } else if (jqXHR.responseText) {
                        abrirPantallaAviso("Atención", jqXHR.responseText, "0");
                    }

                    if (errorCallback) {
                        errorCallback.call(this, jqXHR.responseXML);
                    }
                }
                else {
                    if (errorCallback) {
                        errorCallback.call(this, jqXHR.responseText);
                    }
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            hideOverlay("loading1");
            if (jqXHR.responseText.indexOf(SESSIONERROR) == 0) {
                window.location.href = "/cidus/idulogon.asp";
                return false;
            }
            else {
                if (errorCallback) {
                    errorCallback.call(this, jqXHR.responseText);
                }
                else {
                    if (jqXHR.responseText != "") {
                        abrirPantallaAviso("Atención", "MSG_E" + jqXHR.responseText, "0");
                    }
                }
                return false;
            }
        }
    });
}

function uploadFileForm(form, successCallback, errorCallback, additionalAjaxOptions) { // Nuevo parámetro
    showOverlay({
        overlayName: "loading1",
        overlayClass: "loading",
        overlayWindowClass: "loading_content"
    });

    var url = SCR_UPLOAD;
    if (isIE()) {
        url += "?csrf_token=" + encodeURIComponent(additionalAjaxOptions.headers["X-CSRF-Token"]);
    }
    
    var ajaxSubmitOptions = {
        url: url,
        type: "POST",
        success: function (data, textStatus, jqXHR, $form) {
            hideOverlay("loading1");
            
            if (successCallback) {
                successCallback.call(this, data);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) { // Parámetros corregidos para coincidir con jQuery
            hideOverlay("loading1");
            
            // Mantener tu lógica de error original, solo ajustando los parámetros de la función
            if (jqXHR.responseText && jqXHR.responseText.indexOf(SESSIONERROR) == 0) { // Añadida comprobación de existencia de responseText
                window.location.href = URL_LOGON;
                // return false; // No tiene efecto aquí
            } else {
                if (errorCallback) {
                    errorCallback.call(this, jqXHR.responseText);
                } else {
                    var errorMsgToShow = "";
                    if (jqXHR.status == 500) {
                        errorMsgToShow = jqXHR.responseText != "" ? jqXHR.responseText : jqXHR.statusText;
                    } else if (jqXHR.responseText != "") {
                        errorMsgToShow = jqXHR.responseText;
                    } else {
                        errorMsgToShow = errorThrown || "Error desconocido";
                    }
                    if (errorMsgToShow.indexOf("MSG_E") === 0) errorMsgToShow = errorMsgToShow.substring(5);
                    abrirPantallaAviso("Atención", "MSG_E" + errorMsgToShow, "0");
                }
            }
        }
    };
    
    // Fusionar las opciones adicionales si se proporcionan
    if (additionalAjaxOptions && typeof additionalAjaxOptions === 'object') {
        ajaxSubmitOptions = $.extend(true, {}, ajaxSubmitOptions, additionalAjaxOptions); // Usar deep extend por si acaso
    }
    
    $(form).ajaxSubmit(ajaxSubmitOptions);
}

function uploadFile(successCallback) {

    showOverlayPage(
        SCR_UPLOAD_WINDOW,
        {
            contenedor: "cargaFicheros",
            overlayName: "cargaFicheros",
            overlayTitle: "Importar Fichero"
        },
        500,
        undefined,
        function () {
            $("#subido").change(function () {
                if ($(this).val() == 1) {
                    if (successCallback) {
                        successCallback.call(
                            this,
                            $("#rutaFichero").val());
                    }
                }
            });
        });
}

function showOverlay(overlayName, overlayClass, overlayContentClass, callback) {

    var div = document.createElement("div");
    div.id = overlayName;
    document.body.appendChild(div);

    var divContent = document.createElement("div");
    div.appendChild(divContent);

    $(div).attr("class", overlayClass);

    $(divContent).attr("class", overlayContentClass);
    $(divContent).focus();

    if (callback) {
        callback.call(this);
    }
}

function showOverlayPage(page, parameters, width, height, callback) {

    var div = document.createElement("div");
    div.id = parameters["contenedor"];
    document.body.appendChild(div);

    var divContent = document.createElement("div");
    div.appendChild(divContent);

    $(div).attr("class", "overlay");

    $(divContent).hide();
    $(divContent).width(width);
    $(divContent).height(height);
    $(divContent).attr("class", "overlay_content");

    $(divContent).load(page, parameters, function () {
        $(divContent).show();
        $(divContent).focus();
        if (callback) {
            callback.call(this);
        }
    });
}

function hideOverlay(overlayName) {
    var div = $("#" + overlayName);
    if (div) {
        div.html("");
        div.remove();
    }
}

function buscadorIntervinientes(selectionCallback) {
    showOverlayPage(
        "Buscar_Interviniente.asp",
        { contenedor: "buscadorIntervinientes" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Formateado_Seleccionado").val(),
                            $("#Nombre_Interviniente_Seleccionado").val(),
                            $("#Sexo_Seleccionado").val(),
                            $("#Fecha_Nacimiento_Seleccionado").val(),
                            $("#Situacion_Seleccionado").val(),
                            $("#Nici_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorIntervinientesBurofax(selectionCallback) {
    showOverlayPage("Buscar_Interviniente_Burofax.asp",
        { contenedor: "buscadorIntervinientesBurofax" },
        600,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Formateado").val(),
                            $("#Nombre_Interviniente_Seleccionado").val(),
                            $("#Tipo_Relacion_Seleccionado").val(),
                            $("#Participacion_Seleccionado").val(),
                            $("#Orden_Relacion_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorDomiciliosInterviniente(selectionCallback) {
    showOverlayPage("Buscar_Domicilios_Interviniente.asp",
        { contenedor: "buscadorDomiciliosInterviniente" },
        600,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Domicilio_Seleccionado").val(),
                            $("#Calle_Seleccionado").val(),
                            $("#Codigo_Postal_Seleccionado").val(),
                            $("#Provincia_Seleccionado").val(),
                            $("#Localidad_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorIntervinientesDemanda(selectionCallback) {
    showOverlayPage("Buscar_Interviniente_Demanda.asp",
        { contenedor: "buscadorIntervinientesDemanda" },
        600,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Seleccionado").val(),
                            $("#Clalf_Interviniente_Formateado").val(),
                            $("#Nombre_Interviniente_Seleccionado").val(),
                            $("#Tipo_Relacion_Seleccionado").val(),
                            $("#Participacion_Seleccionado").val(),
                            $("#Orden_Relacion_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorIntervinientesConcursos(selectionCallback) {
    showOverlayPage(
        "Buscar_Interviniente_Concurso.asp",
        { contenedor: "buscadorIntervinientesConcurso" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Nif_Interviniente_Seleccionado").val(),
                            $("#Nombre_Interviniente_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorBienes(selectionCallback, uso) {
    showOverlayPage(
        "Buscar_Bien.asp",
        { contenedor: "buscadorBienes", modoUso: uso },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Bien_Seleccionado").val(),
                            $("#Desc_Bien_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorPromociones(selectionCallback) {
    showOverlayPage(
        "Buscar_Promocion.asp",
        { contenedor: "buscadorPromociones" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Promocion_Seleccionado").val(),
                            $("#Descripcion_Promocion_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorExpedientes(selectionCallback, uso) {
    showOverlayPage(
        "Buscar_Expediente.asp",
        { contenedor: "buscadorExpedientes", modoUso: uso },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Expediente_Seleccionado").val(),
                            $("#Numero_Expediente_Seleccionado").val(),
                            $("#Numero_Renovacion_Seleccionado").val());
                    }
                }
            });
        }, "normal");
}

function buscadorDemandas(selectionCallback) {
    showOverlayPage(
        "Buscar_Demanda.asp",
        { contenedor: "buscadorDemandas" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Demanda_Seleccionada").val(),
                            $("#Numero_Demanda_Seleccionada").val());
                    }
                }
            });
        });
}

function buscadorDemandasInstitucionales(selectionCallback) {
    showOverlayPage(
        "Buscar_Demanda_Institucional.asp",
        { contenedor: "buscadorDemandasInstitucionales" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Demanda_Institucional_Seleccionada").val(),
                            $("#Numero_Demanda_Institucional_Seleccionada").val());
                    }
                }
            });
        });
}

function buscadorExpedientesConcursales(selectionCallback) {
    showOverlayPage(
        "Buscar_Expediente_Concursal.asp",
        { contenedor: "buscadorExpedientesConcursales" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_ExpedienteConcursal_Seleccionado").val(),
                            $("#Numero_ExpedienteConcursal_Seleccionado").val());
                    }
                }
            });
        });
}

function buscadorDaciones(selectionCallback) {
    showOverlayPage("Buscar_Dacion.asp",
        { contenedor: "buscadorDaciones" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Numero_Dacion_Seleccionada").val());
                    }
                }
            });
        });
}

function buscadorFacturas(selectionCallback) {
    showOverlayPage("Buscar_Factura.asp",
        { contenedor: "buscadorFacturas" },
        775,
        undefined,
        function () {
            $("#Seleccionado").change(function () {
                //alert("he seleccionado a");
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#Id_Factura_Seleccionada").val()
                        );
                    }
                }
            });
        });
}

var integerSettings = {
    decimalPlaces: 0,
    decimalSeparator: "",
    thousandsSeparator: "",
    prefix: "",
    suffix: ""
};

var decimalSettings = {
    decimalPlaces: 2,
    decimalSeparator: ",",
    thousandsSeparator: ".",
    prefix: "",
    suffix: ""
};

var percentSettings = {
    decimalPlaces: 2,
    decimalSeparator: ",",
    thousandsSeparator: ".",
    prefix: "",
    suffix: ""
};

var interestSettings = {
    decimalPlaces: 4,
    decimalSeparator: ",",
    thousandsSeparator: ".",
    prefix: "",
    suffix: ""
};

var currencySettings = {
    decimalPlaces: 2,
    decimalSeparator: ",",
    thousandsSeparator: ".",
    prefix: "",
    suffix: "€"
};

function stringToNumber(str, settings) {
    var decChar = ".";
    var grChar = "";
    var decDigits = 0;
    var prefix = "";
    var suffix = "";

    if (settings) {
        if (settings.decimalPlaces) { decDigits = settings.decimalPlaces; }
        if (settings.decimalSeparator) { decChar = settings.decimalSeparator; }
        if (settings.thousandsSeparator) { grChar = settings.thousandsSeparator; }
        if (settings.prefix) { prefix = settings.prefix; }
        if (settings.suffix) { suffix = settings.suffix; }
    }

    if (grChar != "") {
        str = str.replace(grChar, "");
    }

    if (decChar != ".") {
        str = str.replace(decChar, ".");
    }

    if (prefix != "") {
        str = str.replace(prefix, "");
    }

    if (suffix != "") {
        str = str.replace(suffix, "");
    }

    return parseFloat(str);
}

function numberToString(number, settings) {
    var decChar = ".";
    var grChar = "";
    var decDigits = 0;
    var prefix = "";
    var suffix = "";

    if (settings) {
        if (settings.decimalPlaces) { decDigits = settings.decimalPlaces; }
        if (settings.decimalSeparator) { decChar = settings.decimalSeparator; }
        if (settings.thousandsSeparator) { grChar = settings.thousandsSeparator; }
        if (settings.prefix) { prefix = settings.prefix; }
        if (settings.suffix) { suffix = settings.suffix; }
    }

    var str = number.toFixed(decDigits).toString();

    if (decChar != ".") {
        str = str.replace(".", decChar);
    }

    var x = str.split(decChar);
    var integerPart = x[0];
    var decimalPart = x.length > 1 ? decChar + x[1] : "";

    if (grChar != "") {
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(integerPart)) {
            integerPart = integerPart.replace(rgx, "$1" + grChar + "$2");
        }
    }

    var result = integerPart + decimalPart;

    if (prefix != "") {
        result = prefix + " " + result;
    }

    if (suffix != "") {
        result += " " + suffix;
    }

    return result;
}

var eventHandlerEnteroBlur = function () {
    numeroDecimal(this, 0);
};

var eventHandlerImporteFocus = function () {
    $(this).toNumber();
};

var eventHandlerImporteBlur = function () {
    var valor = $(this).val();
    if (valor != "") {
        if (isNaN(parseFloat(valor))) {
            abrirPantallaAviso("Atención", "El dato introducido no es un importe válido", "0");
            $(this).focus();
        }
        else {
            $(this).formatCurrency({ region: "es" });
        }
    }
};

var eventHandlerPorcentajeBlur = function () {
    var valor = $(this).val();
    if (parseFloat(valor) > 100) {
        abrirPantallaAviso("Atención", "El porcentaje no puede ser mayor de 100%", "0");
    }
    numeroDecimal(this, 2);
};

var eventHandlerInteresBlur = function () {
    numeroDecimal(this, 4);
};

var eventHandlerFechaBlur = function () {
    validarFecha(this);
};

function addLibraryEvent(element, event, eventName) {
    $(element).unbind(eventName);
    $(element).bind(eventName, event);
}

function removeLibraryEvent(element, eventName) {
    $(element).unbind(eventName);
}

$.fn.extend({
    padLeft: function (width, c, value) {
        if (!c) {
            c = " ";
        }

        if (value == undefined) {
            value = $(this).val();
        }

        if (("" + value).length >= width) {
            return "" + value;
        } else {
            return arguments.callee.call(this, width, c, c + value);
        }
    },
    padRight: function (width, c, value) {
        if (!c) {
            c = " ";
        }

        if (value == undefined) {
            value = $(this).val();
        }

        if ((value + "").length >= width) {
            return value + "";
        } else {
            return arguments.callee.call(this, width, c, value + c);
        }
    },
    checked: function (value) {
        value = leerBooleano(value);
        if (value != undefined) {
            return this.attr("checked", value);
        }
        else {
            return this.attr("checked");
        }
    },
    visible: function (value) {
        value = leerBooleano(value);
        if (value != undefined) {
            if (value == true) {
                return this.show();
            }
            else {
                return this.hide();
            }
        }
        else {
            return this.is(":visible");
        }
    },
    selectedIndex: function (value) {
        $(this).attr("selectedIndex", value);
    },
    format: function () {
        if (this.hasClass("entero")) {
            numeroDecimal(this, 0);

            addLibraryEvent(this, eventHandlerEnteroBlur, "blur.libreria");
        }
        else if (this.hasClass("importe")) {
            this.formatCurrency({ region: "es" });

            addLibraryEvent(this, eventHandlerImporteFocus, "focus.libreria");
            addLibraryEvent(this, eventHandlerImporteBlur, "blur.libreria");
        }
        else if (this.hasClass("porcentaje")) {
            numeroDecimal(this, 2);

            addLibraryEvent(this, eventHandlerPorcentajeBlur, "blur.libreria");
        }
        else if (this.hasClass("interes")) {
            numeroDecimal(this, 4);

            addLibraryEvent(this, eventHandlerInteresBlur, "blur.libreria");
        }
        else if (this.hasClass("fecha")) {
            addLibraryEvent(this, eventHandlerFechaBlur, "blur.libreria");

            if (!this.hasClass("hasDatepicker")) {
                this.datepicker({
                    showOn: "button",
                    changeMonth: true,
                    changeYear: true,
                    buttonImage: "images/arco/calendar.gif",
                    buttonImageOnly: true,
                    buttonText: "click para seleccionar..."
                });
            }
            else {
                this.datepicker("enable");
            }
        }
        else if (this.hasClass("enteroDeshabilitado")) {
            numeroDecimal(this, 0);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("importeDeshabilitado")) {
            this.formatCurrency({ region: "es" });

            removeLibraryEvent(this, "focus.libreria");
            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("porcentajeDeshabilitado")) {
            numeroDecimal(this, 2);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("interesDeshabilitado")) {
            numeroDecimal(this, 4);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("fechaDeshabilitada")) {
            removeLibraryEvent(this, "blur.libreria");
        }
    },
    enable: function (value) {
        if (value != undefined) {
            this.val(value);
        }

        if (this.hasClass("alfanumerico") || this.hasClass("alfanumericoDeshabilitado")) {
            if (this.hasClass("alfanumericoDeshabilitado")) {
                this.removeClass("alfanumericoDeshabilitado");
                this.addClass("alfanumerico");
            }
            this.attr("readonly", false);
        }
        else if (this.hasClass("textarea") || this.hasClass("textareaDeshabilitado")) {
            if (this.hasClass("textareaDeshabilitado")) {
                this.removeClass("textareaDeshabilitado");
                this.addClass("textarea");
            }
            this.attr("readonly", false);
        }
        else if (this.hasClass("check") || this.hasClass("checkDeshabilitado")) {
            if (this.hasClass("checkDeshabilitado")) {
                this.removeClass("checkDeshabilitado");
                this.addClass("check");
            }

            if (value != undefined) {
                this.checked(value);
            }

            this.attr("disabled", false);
            this.attr("readonly", false);
        }
        else if (this.hasClass("combo") || this.hasClass("comboDeshabilitado")) {
            var dtlId = $(this).attr("id") + "DetailedText";
            if (!this.hasClass("hasDetailedText")) {
                this.addClass("hasDetailedText");

                var dtlCTRL = document.createElement("input");
                $(dtlCTRL).attr("type", "text");
                $(dtlCTRL).attr("id", dtlId);
                $(dtlCTRL).attr("name", dtlId);
                $(dtlCTRL).attr("style", this.attr("style"));
                $(dtlCTRL).attr("class", "alfanumericoDeshabilitado");
                $(dtlCTRL).attr("readonly", true);
                $(dtlCTRL).insertAfter(this);
            }

            $("#" + dtlId).hide();

            if (this.hasClass("comboDeshabilitado")) {
                this.removeClass("comboDeshabilitado");
                this.addClass("combo");
            }

            this.show();
        }
        else if (this.hasClass("entero") || this.hasClass("enteroDeshabilitado")) {
            if (this.hasClass("enteroDeshabilitado")) {
                this.removeClass("enteroDeshabilitado");
                this.addClass("entero");
            }
            this.attr("readonly", false);
            numeroDecimal(this, 0);

            addLibraryEvent(this, eventHandlerEnteroBlur, "blur.libreria");
        }
        else if (this.hasClass("importe") || this.hasClass("importeDeshabilitado")) {
            if (this.hasClass("importeDeshabilitado")) {
                this.removeClass("importeDeshabilitado");
                this.addClass("importe");
            }
            this.attr("readonly", false);
            this.formatCurrency({ region: "es" });

            addLibraryEvent(this, eventHandlerImporteFocus, "focus.libreria");
            addLibraryEvent(this, eventHandlerImporteBlur, "blur.libreria");
        }
        else if (this.hasClass("porcentaje") || this.hasClass("porcentajeDeshabilitado")) {
            if (this.hasClass("porcentajeDeshabilitado")) {
                this.removeClass("porcentajeDeshabilitado");
                this.addClass("porcentaje");
            }
            this.attr("readonly", false);
            numeroDecimal(this, 2);

            addLibraryEvent(this, eventHandlerPorcentajeBlur, "blur.libreria");
        }
        else if (this.hasClass("interes") || this.hasClass("interesDeshabilitado")) {
            if (this.hasClass("interesDeshabilitado")) {
                this.removeClass("interesDeshabilitado");
                this.addClass("interes");
            }
            this.attr("readonly", false);
            numeroDecimal(this, 4);

            addLibraryEvent(this, eventHandlerInteresBlur, "blur.libreria");
        }
        else if (this.hasClass("fecha") || this.hasClass("fechaDeshabilitada")) {
            if (this.hasClass("fechaDeshabilitada")) {
                this.removeClass("fechaDeshabilitada");
                this.addClass("fecha");
            }
            this.attr("readonly", false);

            if (!this.hasClass("hasDatepicker")) {
                this.datepicker({
                    showOn: "button",
                    changeMonth: true,
                    changeYear: true,
                    buttonImage: "images/arco/calendar.gif",
                    buttonImageOnly: true,
                    buttonText: "click para seleccionar..."
                });
            }
            else {
                this.datepicker("enable");
            }

            addLibraryEvent(this, eventHandlerFechaBlur, "blur.libreria");
        }
        else if (this.hasClass("boton") || this.hasClass("botonDeshabilitado")) {
            if (this.hasClass("botonDeshabilitado")) {
                this.removeClass("botonDeshabilitado");
                this.addClass("boton");
            }
            this.attr("disabled", false);
        }
        else if (this.hasClass("flecha") || this.hasClass("flechaDeshabilitada")) {
            if (this.hasClass("flechaDeshabilitada")) {
                this.removeClass("flechaDeshabilitada");
                this.addClass("flecha");
            }
            this.attr("disabled", false);
        }
        else if (this.hasClass("lupa") || this.hasClass("lupaDeshabilitada")) {
            if (this.hasClass("lupaDeshabilitada")) {
                this.removeClass("lupaDeshabilitada");
                this.addClass("lupa");
            }
            this.attr("disabled", false);
        }
        else {
            this.attr("disabled", false);
            this.attr("readonly", false);
        }
    },
    disable: function (value) {
        if (value != undefined) {
            this.val(value);
        }

        if (this.hasClass("alfanumerico") || this.hasClass("alfanumericoDeshabilitado")) {
            if (this.hasClass("alfanumerico")) {
                this.removeClass("alfanumerico");
                this.addClass("alfanumericoDeshabilitado");
            }
            this.attr("readonly", true);
        }
        else if (this.hasClass("textarea") || this.hasClass("textareaDeshabilitado")) {
            if (this.hasClass("textarea")) {
                this.removeClass("textarea");
                this.addClass("textareaDeshabilitado");
            }
            this.attr("readonly", true);
        }
        else if (this.hasClass("check") || this.hasClass("checkDeshabilitado")) {
            if (this.hasClass("check")) {
                this.removeClass("check");
                this.addClass("checkDeshabilitado");
            }

            if (value != undefined) {
                this.checked(value);
            }

            this.attr("disabled", true);
            this.attr("readonly", true);
        }
        else if (this.hasClass("combo") || this.hasClass("comboDeshabilitado")) {
            var dtlId = $(this).attr("id") + "DetailedText";
            if (!this.hasClass("hasDetailedText")) {
                this.addClass("hasDetailedText");

                var dtlCTRL = document.createElement("input");
                $(dtlCTRL).attr("type", "text");
                $(dtlCTRL).attr("id", dtlId);
                $(dtlCTRL).attr("name", dtlId);
                $(dtlCTRL).attr("style", this.attr("style"));
                $(dtlCTRL).attr("class", "alfanumericoDeshabilitado");
                $(dtlCTRL).attr("readonly", true);
                $(dtlCTRL).insertAfter(this);
            }

            if (this.hasClass("combo")) {
                this.removeClass("combo");
                this.addClass("comboDeshabilitado");
            }

            this.hide();

            $("#" + dtlId).val($(this).find("option:selected").text());
            $("#" + dtlId).show();
        }
        else if (this.hasClass("entero") || this.hasClass("enteroDeshabilitado")) {
            if (this.hasClass("entero")) {
                this.removeClass("entero");
                this.addClass("enteroDeshabilitado");
            }
            this.attr("readonly", true);
            numeroDecimal(this, 0);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("importe") || this.hasClass("importeDeshabilitado")) {
            if (this.hasClass("importe")) {
                this.removeClass("importe");
                this.addClass("importeDeshabilitado");
            }
            this.attr("readonly", true);
            this.formatCurrency({ region: "es" });

            removeLibraryEvent(this, "focus.libreria");
            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("porcentaje") || this.hasClass("porcentajeDeshabilitado")) {
            if (this.hasClass("porcentaje")) {
                this.removeClass("porcentaje");
                this.addClass("porcentajeDeshabilitado");
            }
            this.attr("readonly", true);
            numeroDecimal(this, 2);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("interes") || this.hasClass("interesDeshabilitado")) {
            if (this.hasClass("interes")) {
                this.removeClass("interes");
                this.addClass("interesDeshabilitado");
            }
            this.attr("readonly", true);
            numeroDecimal(this, 4);

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("fecha") || this.hasClass("fechaDeshabilitada")) {
            if (this.hasClass("fecha")) {
                this.removeClass("fecha");
                this.addClass("fechaDeshabilitada");
            }
            this.attr("readonly", true);

            try { this.datepicker("destroy"); } catch (ex) { } //Intentar quitar el datepicker

            removeLibraryEvent(this, "blur.libreria");
        }
        else if (this.hasClass("boton") || this.hasClass("botonDeshabilitado")) {
            if (this.hasClass("boton")) {
                this.removeClass("boton");
                this.addClass("botonDeshabilitado");
            }
            this.attr("disabled", true);
        }
        else if (this.hasClass("flecha") || this.hasClass("flechaDeshabilitada")) {
            if (this.hasClass("flecha")) {
                this.removeClass("flecha");
                this.addClass("flechaDeshabilitada");
            }
            this.attr("disabled", true);
        }
        else if (this.hasClass("lupa") || this.hasClass("lupaDeshabilitada")) {
            if (this.hasClass("lupa")) {
                this.removeClass("lupa");
                this.addClass("lupaDeshabilitada");
            }
            this.attr("disabled", true);
        }
        else {
            this.attr("disabled", true);
            this.attr("readonly", true);
        }
    },
    isDisabled: function () {
        if (this.hasClass("alfanumericoDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("textareaDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("checkDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("comboDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("enteroDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("importeDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("porcentajeDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("interesDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("fechaDeshabilitada")) {
            return true;
        }
        else if (this.hasClass("botonDeshabilitado")) {
            return true;
        }
        else if (this.hasClass("flechaDeshabilitada")) {
            return true;
        }
        else {
            this.attr("disabled");
        }
    },
    applyProductMask: function (productType) {
        var mask = getProductMask(productType);
        if (mask != null) {
            $.extend($.inputmask.defaults.definitions, {
                "N": {
                    "validator": "[0-9]",
                    "cardinality": 1,
                    "prevalidator": null
                }
            });
            this.inputmask({ "mask": mask });
        }
        else {
            this.inputmask("remove");
        }
    },
    cleanProductMask: function () {
        this.inputmask("remove");
    },
    applyTextMask: function (mask) {
        var maskLength = mask.length;
        if ($(this).val() != "") {
            var tmpValue = mask + $(this).val();
            $(this).val(tmpValue.slice(-maskLength));
        }
    },
    valUnformatted: function () {
        var ctrl = $("<input>");
        ctrl.val(this.val());

        if (this.hasClass("importe") || this.hasClass("importeDeshabilitado")) {
            return ctrl.toNumber().val();
        }
        else if (this.hasClass("check") || this.hasClass("checkDeshabilitado")) {
            return this.checked();
        }
        else if (this.inputmask != undefined) {
            return this.inputmask("unmaskedvalue");
        }
        else {
            return this.val();
        }
    },
    valBoolean: function (valor) {
        var v;
        if (valor == undefined) {
            v = $(this).val();
        }
        else {
            v = valor;
        }

        var bool = leerBooleano(v);

        if (valor == undefined) {
            return bool;
        }
        else {
            return $(this).val(bool);
        }
    },
    valDate: function (valor) {
        var v;
        var srcfmt;
        var destfmt;
        if (valor == undefined) {
            v = $(this).val();
            srcfmt = "dd/mm/yy";
            destfmt = "yy-mm-dd";
        }
        else {
            v = valor;
            srcfmt = "yy-mm-dd";
            destfmt = "dd/mm/yy";
        }

        var fecha = $.datepicker.parseDate(srcfmt, v);
        var fechaFormateada = $.datepicker.formatDate(destfmt, fecha);

        if (valor == undefined) {
            return fechaFormateada;
        }
        else {
            return $(this).val(fechaFormateada);
        }
    },
    valNumeric: function (valor, settings) {
        if (valor == undefined) {
            return stringToNumber($(this).val(), settings);
        }
        else {
            if (isFinite(valor)) {
                return this.val(parseFloat(valor));
            }
            else {
                return $(this).val(stringToNumber(valor, settings));
            }
        }
    },
    valInteger: function (valor) {
        var v = this.valNumeric(valor, integerSettings);

        numeroDecimal(this, 0);

        return v;
    },
    valPercent: function (valor) {
        var v = this.valNumeric(valor, percentSettings);

        numeroDecimal(this, 2);

        return v;
    },
    valInterest: function (valor) {
        var v = this.valNumeric(valor, interestSettings);

        numeroDecimal(this, 4);

        return v;
    },
    valCurrency: function (valor) {
        var v = this.valNumeric(valor, currencySettings);

        this.formatCurrency();

        return v;
    },
    textBoolean: function () {
        return leerBooleano($(this).text());
    },
    textDate: function () {
        var v = $(this).text();

        var fecha = $.datepicker.parseDate("yy-mm-dd", v);
        var fechaFormateada = $.datepicker.formatDate("dd/mm/yy", fecha);

        return fechaFormateada;
    },
    textNumeric: function (decimales) {
        var v = $(this).text();

        var ctrl = $("<input />");
        ctrl.val(v);
        numeroDecimal(ctrl, decimales);

        return ctrl.val();
    },
    textInteger: function () {
        return this.textNumeric(0);
    },
    textPercent: function (valor) {
        return this.textNumeric(2);
    },
    textInterest: function (valor) {
        return this.textNumeric(4);
    },
    textCurrency: function (valor) {
        return this.textNumeric(2);
    },
    print: function (width, height) {
        if (width == undefined) {
            width = 800;
        }
        if (height == undefined) {
            height = 600;
        }
        var wnd = window.open("", "", "scroll=true,status=no,height=" + height + ",width=" + width);
        wnd.document.write($(this).html());
        wnd.document.close();
        wnd.print();
        wnd.close();
    },
    defaultTab: function (maintainContent) {
        $(this).tabs({
            load: function (event, ui) {
                if (maintainContent !== true) {
                    $(ui.panel).siblings(".ui-tabs-panel").empty();
                }
            }
        });
    }
});

function imprimirPagina(pagina, parametros, width, height, question, showMessage) {
    var res = 1;
    if (question && showMessage == true) {
        res = abrirPantallaAviso("Atención", "MSG_Q" + question);
    }

    if (res == 1) {
        var ctrl = $("<div />").load(
            pagina,
            $.extend({}, parametros, { CSRFToken: csrfToken }),
            function () {
                ctrl.print(width, height);
                ctrl.remove();
            });
    }
}

function getProductMask(productType) {
    var prType = $.trim(productType);
    if (prType == "AVA" ||
        prType == "PGP" ||
        prType == "PGR" ||
        prType == "PGS" ||
        prType == "PME") {
        //Avales o Prestamos
        return "NNNNN-NNN-NNNNNN-N-NN-NNNN";
    }
    else if (
        prType == "CGP" ||
        prType == "CGR" ||
        prType == "DES" ||
        prType == "DX" ||
        prType == "FC" ||
        prType == "LIN" ||
        prType == "DI" ||
        prType == "CF" ||
        prType == "SC") {
        //Créditos (Garantía Personal)(Garantía Real), Ahorro, Comercio Exterior, Factoring, Confirming
        return "NNNNN-NN-NNNNNN-NN";
    }
    else if (
        prType == "LSB") {
        //Leasing Banco
        return "NNNNN-NNNNNNNN-N";
    }
    else if (
        prType == "LS" ||
        prType == "RN" ||
        prType == "LSI") {
        //Leasing - Renting - Leasing Inmobiliario
        return "NNNNN-NNNNNNNN-N";
    }
    else if (
        prType == "TC" ||
        prType == "TAR") {
        //Tarjetas
        return "NNNNN-NNNN-NNNN-NNNN-NNNN";
    }
    else if (
        prType == "MD") {
        //Coberturas
        return "NNNNN-NN-NNNNNNNN";
    }
    else if (
        prType == "CCC") {
        //Coberturas
        return "NNNN-NNNN-NN-NNNNNNNNNN";
    }
    else {
        //Otros
        return null;
    }
}

function nonProductFilter(text) {
    var tmp = text.replace(/\./g, "");
    tmp = tmp.replace(/\-/g, "");
    tmp = tmp.replace(/\ /g, "");
    return tmp;
}

function previewFile(fileName, fileExtension, downloadsPage) {
    if (!downloadsPage) downloadsPage = "fileDownload.asp";
    window.open(
        downloadsPage + "?mode=inline&fileName=" + fileName + "&fileType=" + fileExtension,
        "consulta_documento",
        "resizable=yes, scrollbars=yes");
}

function downloadFile(fileName, fileExtension, bufferIndex, downloadsPage) {
    if (!downloadsPage) downloadsPage = "fileDownload.asp";
    if (!bufferIndex) bufferIndex = "0";
    var url = downloadsPage +
        "?bufferIndex=" + bufferIndex +
        "&mode=attachment" +
        "&fileName=" + fileName +
        "&fileType=" + fileExtension;

    if (isIE()) {
        window.open(url, "_blank", "toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000, top=10000, width=10, height=10, visible=none");
    } else {
        window.open(url, "blank").focus();
    }
}

function infoExpediente(numExpediente, numRenovacion) {
    return showOverlayPage(
        "info_expediente_popup.asp",
        {
            contenedor: "infoExpediente",
            numExpediente: numExpediente,
            numRenovacion: numRenovacion
        },
        720);
}

function infoDemanda(numDemanda) {
    return showOverlayPage(
        "info_demanda_popup.asp",
        {
            contenedor: "infoDemanda",
            numDemanda: numDemanda
        },
        720);
}

function showResponseMessages(xml) {
    var messages = $(xml).find("*>MessageList>*");
    for (var i = 0; i < messages.length; i++) {

        var mensaje = messages[i].text || messages[i].textContent;
        abrirPantallaAviso("Atención", mensaje, "0");
    }
}

function gestionDuplicados(xml, selectionCallback) {
    showOverlayPage(
        "int_clalf_duplicado.asp",
        { contenedor: "gestionDuplicados", xml: xml.xml },
        680,
        undefined,
        function () {
            $("#cerrarIntDup").change(function () {
                if ($(this).val() == 1) {
                    if (selectionCallback) {
                        selectionCallback.call(
                            this,
                            $("#clalfIntervinienteDuplicado").val());
                    }
                }
            });
        });
}

function verMotivoPrecontencioso(titulo, texto) {
    showOverlayPage(
        "prc_precontencioso_motivo.asp",
        {
            contenedor: "verMotivoPrecontencioso",
            titulo: titulo,
            texto: texto
        },
        300);
}

function verMotivoContencioso(titulo, texto) {
    showOverlayPage(
        "con_contencioso_motivo.asp",
        {
            contenedor: "verMotivoContencioso",
            titulo: titulo,
            texto: texto
        },
        300);
}

function verMotivoBurofax(texto, closedCallback) {
    showOverlayPage(
        "prc_burofax_motivo.asp",
        {
            contenedor: "verMotivoBurofax",
            operacion: "Consulta",
            texto: texto
        },
        600,
        undefined,
        function () {
            $("#cerrarMtoBurofax").change(function () {
                if (closedCallback) {
                    closedCallback.call(this);
                }
            });
        });
}

function modificarMotivoBurofax(texto, closedCallback) {
    showOverlayPage(
        "prc_burofax_motivo.asp",
        {
            contenedor: "modificarMotivoBurofax",
            operacion: "Edicion",
            texto: texto
        },
        600,
        undefined,
        function () {
            $("#cerrarMtoBurofax").change(function () {
                if ($(this).val() == 1) {
                    if (closedCallback) {
                        closedCallback.call(
                            this,
                            $("#textoModal").val());
                    }
                }
            });
        });
}

function verDetalleGasto(titulo, tipoGasto, conceptoGasto, notaGasto, importePagarGasto, ivaGasto, retencionGasto, fechaValorGasto, fechaContableGasto, procurador, usuario, nombreUsuario, oficina, nombreOficina, importeSujetoExento, importeNoSujetoSuplido) {
    showOverlayPage(
        "info_accion_gastos_consulta.asp",
        {
            contenedor: "verDetalleGasto",
            titulo: titulo,
            tipoGasto: tipoGasto,
            conceptoGasto: conceptoGasto,
            notaGasto: notaGasto,
            importePagarGasto: importePagarGasto,
            ivaGasto: ivaGasto,
            retencionGasto: retencionGasto,
            fechaValorGasto: fechaValorGasto,
            fechaContableGasto: fechaContableGasto,
            procurador: procurador,
            usuario: usuario,
            nombreUsuario: nombreUsuario,
            oficina: oficina,
            nombreOficina: nombreOficina,
            importeSujetoExento: importeSujetoExento,
            importeNoSujetoSuplido: importeNoSujetoSuplido
        },
        750);
}

function verDetalleCobro(titulo, conceptoCobro, motivoCobro, notaCobro, fechaValorCobro, fechaContableCobro, marcaAjuste, importeCobro, modoAbonoCobro, usuario, nombreUsuario, oficina, nombreOficina, xmlBienes, importeSujetoExento, importeNoSujetoSuplido) {
    showOverlayPage(
        "info_accion_cobros_consulta.asp",
        {
            contenedor: "verDetalleCobro",
            titulo: titulo,
            conceptoCobro: conceptoCobro,
            motivoCobro: motivoCobro,
            notaCobro: notaCobro,
            fechaValorCobro: fechaValorCobro,
            fechaContableCobro: fechaContableCobro,
            marcaAjuste: marcaAjuste,
            importeCobro: importeCobro,
            modoAbonoCobro: modoAbonoCobro,
            usuario: usuario,
            nombreUsuario: nombreUsuario,
            oficina: oficina,
            nombreOficina: nombreOficina,
            xmlBienes: xmlBienes,
            importeSujetoExento: importeSujetoExento,
            importeNoSujetoSuplido: importeNoSujetoSuplido
        },
        750);
}

function verDetalleAccion(descripcionAccion, fechaValor, fechaContable, usuario, nombreUsuario, oficina, nombreOficina) {
    showOverlayPage(
        "info_accion_otros_consulta.asp",
        {
            contenedor: "verDetalleAccion",
            descripcionAccion: descripcionAccion,
            fechaValor: fechaValor,
            fechaContable: fechaContable,
            usuario: usuario,
            nombreUsuario: nombreUsuario,
            oficina: oficina,
            nombreOficina: nombreOficina
        },
        750);
}

function verDetalleAccionManual(grupoContable, importe, motivoAjuste, descripcion, fechaValor, fechaContable, usuario, nombreUsuario, oficina, nombreOficina) {
    showOverlayPage(
        "info_accion_manuales_consulta.asp",
        {
            contenedor: "verDetalleAccionManual",
            grupoContable: grupoContable,
            importe: importe,
            motivoAjuste: motivoAjuste,
            descripcion: descripcion,
            fechaValor: fechaValor,
            fechaContable: fechaContable,
            usuario: usuario,
            nombreUsuario: nombreUsuario,
            oficina: oficina,
            nombreOficina: nombreOficina
        },
        750);
}

function altaAjusteContableManual(gruposContables, saldosContables, idOperacion, situacionContable, closedCallback) {
    showOverlayPage(
        "prc_ficha_contable_saldos.asp",
        {
            contenedor: "altaAjusteContableManual",
            gruposContables: gruposContables.join("|"),
            saldosContables: saldosContables.join("|"),
            idOperacion: idOperacion,
            situacionContable: situacionContable
        },
        750,
        undefined,
        function () {
            $("#cerrarMtoSaldosDup").change(function () {
                if ($(this).val() == 1) {
                    if (closedCallback) {
                        closedCallback.call(this);
                    }
                }
            });
        });
}

function impresionSaldoCertificado(firma, cargo, texto, notario, protocolo, identificacion, titular, suscripcion, beneficiario, closedCallback) {
    showOverlayPage(
        "i_prc_saldo_certificado.asp",
        {
            contenedor: "impresionSaldoCertificado",
            firma: firma,
            cargo: cargo,
            texto: texto,
            notario: notario,
            protocolo: protocolo,
            identificacion: identificacion,
            titular: titular,
            suscripcion: suscripcion,
            beneficiario: beneficiario
        },
        900,
        undefined,
        function () {
            $("#cerrarImpCertificado").change(function () {
                if ($(this).val() == 1) {
                    if (closedCallback) {
                        closedCallback.call(
                            this,
                            $("#firmadoModal").val(),
                            $("#cargoModal").val(),
                            $("#beneficiarioModal").val(),
                            $("#notarioModal").val(),
                            $("#protocoloModal").val(),
                            $("#clalfMatrizModal").val(),
                            $("#titulMatrizModal").val(),
                            $("#fesuscMatrizModal").val(),
                            $("#textoModal")[0].value,
                            $("#modoPersonalizadoModal").checked());
                    }
                }
            });
        });
}

function abrirImpresionBurofax(personalizado, closedCallback) {
    showOverlayPage(
        "prc_burofax_imprimir.asp",
        {
            contenedor: "abrirImpresionBurofax",
            mostrarPersonalizado: personalizado
        },
        500,
        undefined,
        function () {
            $("#cerrarImpBurofax").change(function () {
                if ($(this).val() == 1) {
                    if (closedCallback) {
                        closedCallback.call(
                            this,
                            $("#impresiondetalleBurofaxModal").checked(),
                            $("#impresionlistadoBurofaxModal").checked(),
                            $("#EstandarModal").checked());
                    }
                }
            });
        });
}

function abrirPersonalizadoBurofax(destinatarios, direcciones, texto, closedCallback) {
    showOverlayPage(
        "prc_burofax_imprimir_personalizado.asp",
        {
            contenedor: "abrirPersonalizadoBurofax",
            destinatarios: destinatarios.join("|"),
            direcciones: direcciones.join("|"),
            texto: texto
        },
        750,
        undefined,
        function () {
            $("#cerrarImpBurofax").change(function () {
                if ($(this).val() == 1) {
                    if (closedCallback) {
                        closedCallback.call(
                            this,
                            $("#textoModal")[0].value);
                    }
                }
            });
        });
}

function isIE() {
    var userAgent = window.navigator.userAgent.toLowerCase();
    var ie = userAgent.match("msie") || userAgent.match("trident");
    return ie;
}
