import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import ListaProductos from "../components/ListaProductos.js";
import FormularioProductos from "../components/FormularioProductos.js";
import TablaProductos from "../components/TablaProductos";
import { signOut } from "firebase/auth";
import { auth } from "../database/firebaseconfig"; // Ajusta la ruta según tu estructura

const Productos = () => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(false);

  const actualizarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await updateDoc(doc(db, "productos", productoId), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });

        setNuevoProducto({ nombre: "", precio: "" });

        setModoEdicion(false); // Volver al modo registro
        setProductoId(null);

        cargarDatos(); // Recargar lista
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  //Método para editarProducto
  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
    });
    setProductoId(producto.id);
    setModoEdicion(true);
  };

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: "",
  });

  const manejoCambio = (nombre, valor) => {
    setNuevoProducto((prev) => ({
      ...prev,
      [nombre]: valor,
    }));
  };

  const cerrarSesion = async () => {
  try {
    await signOut(auth); // Cierra la sesión del usuario
    console.log("Sesión cerrada correctamente.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};


  const guardarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await addDoc(collection(db, "productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });

        cargarDatos(); // Recargar Lista

        setNuevoProduto({ nombre: "", precio: "" });
      } else {
        alert("Por favor complete todos los campos.");
      }
    } catch (error) {
      console.log("Error al registrar producto:", error);
    }
  };

  const [productos, setProductos] = useState([]);

  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      cargarDatos(); // Recargar lista
    } catch (error) {
      console.log("Error al eliminar:", error);
    }
  };

  return (
    <View style={styles.container}>
      <FormularioProductos
        manejoCambio={manejoCambio}
        nuevoProducto={nuevoProducto}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
        cerrarSesion={cerrarSesion}
      />

      <ListaProductos productos={productos} />

      <TablaProductos
        productos={productos}
        eliminarProducto={eliminarProducto}
        editarProducto={editarProducto}
      />

      <Button title="Cerrar Sesión" onPress={cerrarSesion} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;