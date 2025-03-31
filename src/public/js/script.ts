// Aseguramos que los elementos existen en el DOM
const lista = document.getElementById("lista") as HTMLUListElement;
const itemInput = document.getElementById("itemInput") as HTMLInputElement;
const apiUrl = "http://localhost:3000/items";

interface Item {
  id: number;
  descripcion: string;
}

// Cargar la lista desde el servidor
async function cargarLista(): Promise<void> {
  try {
    const response = await fetch(apiUrl);
    const data: { items: Item[] } = await response.json();
    lista.innerHTML = ""; // Limpiar la lista antes de renderizar
    data.items.forEach(item => renderizarItem(item));
  } catch (error) {
    console.error("Error al cargar la lista", error);
  }
}

// Agregar un nuevo item
async function agregarItem(): Promise<void> {
  const item = itemInput.value.trim();
  if (!item) return;
  itemInput.value = "";

  const itemNormalizado = item.toLowerCase();
  const itemsExistentes = Array.from(document.querySelectorAll("#lista li span"))
    .map(span => span.textContent!.trim().toLowerCase());

  if (itemsExistentes.includes(itemNormalizado)) {
    alert("Este producto ya está en la lista.");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: item })
    });

    const data: Item = await response.json();
    renderizarItem(data);
  } catch (error) {
    console.error("Error al agregar item", error);
  }
}

// Renderizar un item en la lista
function renderizarItem(item: Item): void {
  const li = document.createElement("li");
  li.innerHTML = `
      <span id="${item.id}">${item.descripcion}</span> 
      <button class="danger" onclick="eliminarItem(${item.id}, this)">❌</button>
      <button class="edit" onclick="editarItem(${item.id}, this)">✏️</button>
  `;
  lista.appendChild(li);
}

// Eliminar un item
async function eliminarItem(id: number, boton: HTMLButtonElement): Promise<void> {
  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    boton.parentElement!.remove();
  } catch (error) {
    console.error("Error al eliminar item", error);
  }
}

// Editar un item
async function editarItem(id: number, boton: HTMLButtonElement): Promise<void> {
  const nuevoTexto = prompt("Editar item:", boton.parentElement!.firstChild!.textContent!.trim());
  if (!nuevoTexto) return;

  try {
    await fetch(`${apiUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: nuevoTexto })
    });

    document.getElementById(id.toString())!.textContent = nuevoTexto;
  } catch (error) {
    console.error("Error al editar item", error);
  }
}

// Cargar la lista al iniciar
cargarLista();
