
const API_URL = import.meta.env.VITE_API_URL;
const status = document.getElementById("status");

async function fetchSheets() {
  try {
    const res = await fetch(API_URL);
    const text = await res.text();

    console.log("Raw response:", text);

    // Intentar parsear como JSON
    let sheets;
    try {
      sheets = JSON.parse(text);
    } catch (parseError) {
      status.textContent = "❌ Error: Respuesta no es JSON válido";
      return;
    }

    // Llenar el select con los nombres de hojas
    const select = document.getElementById("sheet");
    select.innerHTML = "";

    sheets.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      select.appendChild(opt);
    });

    renderButtons();
  } catch (err) {
    status.textContent = "❌ Error al cargar hojas: " + err.message;
  }
}

window.renderButtons = function () {
  const selectedSheet = document.getElementById("sheet").value;
  const container = document.getElementById("buttons");
  container.innerHTML = "";

  if (!selectedSheet) return;

  const isLlegada = selectedSheet === "LlegadaClientes";

  const buttons = isLlegada
    ? [
        { label: "Registrar Llegada", func: "registrarLlegada" },
        { label: "Contar Recoger", func: "contarRecoger" },
        { label: "Contar Dejar", func: "contarDejar" },
      ]
    : [{ label: "Registrar Tiempo", func: "registrarTiempo" }];

  buttons.forEach(btn => {
    const el = document.createElement("button");
    el.textContent = btn.label;
    el.onclick = () => sendAction(btn.func, selectedSheet);
    container.appendChild(el);
  });
};

async function sendAction(func, sheet) {
  status.style.color = "black";
  status.textContent = "Ejecutando...";

  try {
    const res = await fetch(`${API_URL}?func=${func}&sheet=${sheet}`, {
      method: "POST",
    });
    const text = await res.text();

    if (func === "registrarTiempo") {
      if (text === "INICIO") {
        status.style.color = "green";
        status.textContent = "✅ Inicio registrado. A la espera de término.";
      } else if (text === "FIN") {
        status.style.color = "green";
        status.textContent = "✅ Registro exitoso.";
      } else {
        status.style.color = "red";
        status.textContent = "❌ Error: " + text;
      }
    } else if (text === "OK") {
      status.style.color = "green";
      status.textContent = "✅ Acción ejecutada correctamente";
    } else {
      status.style.color = "red";
      status.textContent = "❌ Error: " + text;
    }
  } catch (err) {
    status.style.color = "red";
    status.textContent = "❌ Error de red: " + err.message;
  }
}

fetchSheets();
