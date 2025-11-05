import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import FormularioEdad from "../components/edadprom/FormularioEdad.js";
import TablaEdad from "../components/edadprom/TablaEdad.js";
import TituloPromedio from "../components/edadprom/TituloPromedio.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";

const Promedio = () => {
  const [edades, setEdades] = useState([]);
  const [promedio, setPromedio] = useState(null);

  // 🔹 Función opcional: calcular promedio desde API
  const calcularPromedioAPI = async (lista) => {
    try {
      const response = await fetch(
        "https://g7kajg7htk.execute-api.us-east-2.amazonaws.com/calcularpromedio",
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
      const querySnapshot = await getDocs(collection(db, "edades"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      console.log("📂 Datos obtenidos de Firebase:", data); // DEBUG

      setEdades(data);

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
    const datos = await cargarDatosFirebase("promedio");
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

  useEffect(() => {
    cargarDatos();
  }, []);

  // 🔹 Eliminar un registro
  const eliminarEdad = async (id) => {
    try {
      await deleteDoc(doc(db, "edades", id));
      cargarDatos();
    } catch (error) {
      console.log("Error al eliminar:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Formulario para registrar nuevas edades */}
      <FormularioEdad cargarDatos={cargarDatos} />

      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar" onPress={exportarDatos} />
      </View>

      {/* Tabla con los registros */}
      <TablaEdad edades={edades} eliminarEdad={eliminarEdad} />

      {/* Título con el promedio */}
      <TituloPromedio promedio={promedio} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Promedio;
