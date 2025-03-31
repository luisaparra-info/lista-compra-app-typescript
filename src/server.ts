import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Tipado para los items
interface Item {
  id: number;
  descripcion: string;
}

// Tipado para el contenido del archivo JSON
interface ListaItems {
  items: Item[];
}

// Configurar middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo index.html
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para obtener los items desde el archivo JSON
app.get('/items', async (req: Request, res: Response) => {
  try {
    const data = await leerArchivoJson();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

// Ruta para agregar un nuevo item a la lista
app.post('/items', async (req: Request, res: Response) => {
  const { descripcion } = req.body;
  if (!descripcion) {
    res.status(400).json({ error: 'Descripción del item es requerida' });
    return;
  }

  const nuevoItem: Item = { id: Date.now(), descripcion };

  try {
    const data = await leerArchivoJson();
    data.items.push(nuevoItem);
    await escribirArchivoJson(data);
    res.json(nuevoItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el item' });
  }
});

// Ruta para eliminar un item de la lista
app.delete('/items/:id', async (req: Request, res: Response) => {
  try{
  const id = parseInt(req.params.id);

  
    const data = await leerArchivoJson();
    const index = data.items.findIndex(item => item.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }
    data.items.splice(index, 1);
    await escribirArchivoJson(data);
    res.json({ message: 'Item eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
});

// Ruta para editar un item de la lista
app.put('/items/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { descripcion } = req.body;

  if (!descripcion) {
    res.status(400).json({ error: 'Descripción del item es requerida' });
    return;
  }

  try {
    const data = await leerArchivoJson();
    const item = data.items.find(item => item.id === id);
    if (!item) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }
    item.descripcion = descripcion;
    await escribirArchivoJson(data);
    res.json({ message: 'Item actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el item' });
  }
});

// Función para leer el archivo JSON
const leerArchivoJson = (): Promise<ListaItems> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(process.cwd(), 'lista.json'), 'utf8', (err, data) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(data) as ListaItems);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};

// Función para escribir en el archivo JSON
const escribirArchivoJson = (data: ListaItems): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(process.cwd(), 'lista.json'), JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
