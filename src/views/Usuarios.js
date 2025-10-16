// Usuarios.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import FormularioUsuario from "../components/usuarios/FormularioUsuario.js";
import TablaUsuario from "../components/usuarios/TablaUsuario.js";
import TituloUsuarios from "../components/usuarios/TituloUsuarios.js";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [promedio, setPromedio] = useState(null);

  // 🔹 Función opcional: calcular promedio desde API
  const calcularPromedioAPI = async (lista) => {
    try {
      const response = await fetch(
        "https://0jmm5jzrn4.execute-api.us-east-2.amazonaws.com/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ edades: lista.map((item) => item.edad) }),
        }
      );

      const data = await response.json();
      setPromedio(data.promedio || null);
    } catch (error) {
      console.error("Error al calcular promedio en API:", error);
    }
  };

  // 🔹 Cargar documentos desde Firestore
  const cargarDatos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      console.log(" Datos obtenidos de Firebase:", data); // DEBUG

      setUsuarios(data);

      if (data.length > 0) {
        // ✅ Promedio local (seguro aunque la API falle)
        const suma = data.reduce((acc, item) => acc + item.edad, 0);
        const promedioLocal = suma / data.length;
        setPromedio(promedioLocal);

        // 🔹 Si quieres también llamar a la API:
        // calcularPromedioAPI(data);
      } else {
        setPromedio(null);
      }
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  //  Eliminar un registro
  const eliminarUsuario = async (id) => {
    try {
      await deleteDoc(doc(db, "usuarios", id));
      cargarDatos();
    } catch (error) {
      console.log("Error al eliminar:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Formulario para registrar nuevas edades */}
      <FormularioUsuario cargarDatos={cargarDatos} />

      {/* Tabla con los registros */}
      <TablaUsuario usuarios={usuarios} eliminarUsuario={eliminarUsuario} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Usuarios;