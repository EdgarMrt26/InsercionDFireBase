import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import ListaClientes from "../components/clientes/ListaClientes.js";
import FormularioClientes from "../components/clientes/FormularioClientes.js";
import TablaClientes from "../components/clientes/TablaClientes.js";

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