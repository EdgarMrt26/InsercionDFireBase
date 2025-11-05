import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import ListaClientes from "../components/clientes/ListaClientes.js";
import FormularioClientes from "../components/clientes/FormularioClientes.js";
import TablaClientes from "../components/clientes/TablaClientes.js";
import * as FileSystem from "expo-file-system/legacy";
//Nuevas
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [clienteId, setClienteId] = useState(null);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
  });

  const manejoCambio = (campo, valor) => {
    setNuevoCliente((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

    //Nuevas importaciones 
    const cargarDatosFirebase = async (nombreColeccion) => {
    if (!nombreColeccion || typeof nombreColeccion !== 'string') {
      console.error("Error: Se requiere un nombre de colección válido.");
      return;
    }
  
    try {
      const datosExportados = {};
  
      // Obtener la referencia a la colección específica
      const snapshot = await getDocs(collection(db, nombreColeccion));
  
      // Mapear los documentos y agregarlos al objeto de resultados
      datosExportados[nombreColeccion] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return datosExportados;
    } catch (error) {
      console.error(`Error extrayendo datos de la colección '${nombreColeccion}':`, error);
    }
  };
  
    //Segunda importación
    const exportarDatos = async () => {
    try {
      const datos = await cargarDatosFirebase("clientes");
      console.log("Datos cargados:", datos);
  
      // Formatea los datos para el archivo y el portapapeles
      const jsonString = JSON.stringify(datos, null, 2);
  
      const baseFileName = "datos_firebase.txt";
  
      // Copiar datos al portapapeles
      await Clipboard.setStringAsync(jsonString);
      console.log("Datos (JSON) copiados al portapapeles.");
  
      // Verificar si la función de compartir está disponible
      if (!(await Sharing.isAvailableAsync())) {
        alert("La función Compartir/Guardar no está disponible en tu dispositivo");
        return;
      }
  
      // Guardar el archivo temporalmente
      const fileUri = FileSystem.cacheDirectory + baseFileName;
  
      // Escribir el contenido JSON en el caché temporal
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
  
      // Abrir el diálogo de compartir
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Compartir datos de Firebase (JSON)'
      });
  
      alert("Datos copiados al portapapeles y listos para compartir.");
    } catch (error) {
      console.error("Error al exportar y compartir:", error);
      alert("Error al exportar o compartir: " + error.message);
    }
  };

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarCliente = async () => {
    try {
      if (nuevoCliente.nombre && nuevoCliente.apellido) {
        await addDoc(collection(db, "clientes"), nuevoCliente);
        setNuevoCliente({ nombre: "", apellido: "" });
        cargarDatos();
      } else {
        alert("Por favor complete todos los campos.");
      }
    } catch (error) {
      console.log("Error al registrar cliente:", error);
    }
  };

  const editarCliente = (cliente) => {
    setNuevoCliente({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
    });
    setClienteId(cliente.id);
    setModoEdicion(true);
  };

  const actualizarCliente = async () => {
    try {
      if (nuevoCliente.nombre && nuevoCliente.apellido) {
        await updateDoc(doc(db, "clientes", clienteId), nuevoCliente);
        setNuevoCliente({ nombre: "", apellido: "" });
        setModoEdicion(false);
        setClienteId(null);
        cargarDatos();
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, "clientes", id));
      cargarDatos();
    } catch (error) {
      console.log("Error al eliminar cliente:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FormularioClientes
        manejoCambio={manejoCambio}
        nuevoCliente={nuevoCliente}
        guardarCliente={guardarCliente}
        actualizarCliente={actualizarCliente}
        modoEdicion={modoEdicion}
      />

      <ListaClientes clientes={clientes} />

      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar" onPress={exportarDatos} />
      </View>

      <TablaClientes
        clientes={clientes}
        eliminarCliente={eliminarCliente}
        editarCliente={editarCliente}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Clientes;