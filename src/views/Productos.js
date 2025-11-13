import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, Alert } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, QuerySnapshot, orderBy, limit, query, where } from "firebase/firestore";
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";



const Productos = ({cerrarSesion}) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);
  const colecciones = ["productos", "clientes", "edades", "ciudades"];

  const [productos, setProductos] = useState([]);

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

  
  
  const guardarProducto = async () => {
    try {
      if (nuevoProducto.nombre && nuevoProducto.precio) {
        await addDoc(collection(db, "productos"), {
          nombre: nuevoProducto.nombre,
          precio: parseFloat(nuevoProducto.precio),
        });
        cargarDatos(); // Recargar lista
        setNuevoProducto({ nombre: "", precio: "" });
      } else {
        alert("Por favor, complete todos los campos.");
      }
    } catch (error) {
      console.error("Error al registrar producto:", error);
    }
  };

  //Importación de extraer Excel nueva.
  const extraerYGuardarMascotas = async () => {
  try {
    // Abrir selector de documentos para elegir archivo Excel
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.cancelled || !result.assets || result.assets.length === 0) {
      Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
      return;
    }
    const { uri, name } = result.assets[0];
    console.log(`Archivo seleccionado: ${name} en ${uri}`);
    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Enviar a Lambda para procesar
    const response = await fetch('https://ouu45b2h18.execute-api.us-east-1.amazonaws.com/extraerexcel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archivoBase64: base64 }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP en Lambda: ${response.status}`);
    }
    const body = await response.json();
    if (!body.datos || !Array.isArray(body.datos) || body.datos.length === 0) {
      Alert.alert("Error", "No se encontraron datos en el Excel o el archivo esta vacio.");
      return;
    }
    console.log("Datos extraidos del Excel:", body.datos);
    // Guardar cada fila en la coleccion 'mascotas'
    let errores = 0;
    for (const mascota of body.datos) {
      try {
        // Columnas: 'nombre', 'edad', 'raza' (ajusta si los headers son diferentes)
        await addDoc(collection(db, "mascotas"), {
          nombre: mascota.nombre || '',
          edad: parseInt(mascota.edad) || 0,
          raza: mascota.raza || '',
        });
      } catch (err) {
        console.error("Error guardando mascota:", mascota, err);
        errores++;
      }
    }
    const guardados = body.datos.length - errores; // Calculamos los guardados exitosos
    if (errores > 0) {
      Alert.alert(
        "Éxito",
        `Se guardaron ${guardados} mascotas en la colección. Errores: ${errores}.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Éxito", `Se guardaron todas las ${guardados} mascotas en la colección.`);
    }

  } catch (error) {
    console.error("Error en extraerYGuardarMascotas:", error);
    Alert.alert("Error", "Error procesando el Excel: " + error.message);
  }
};

//Importación de extraer Excel nueva.
  const extraerYGuardarBicicletas = async () => {
  try {
    // Abrir selector de documentos para elegir archivo Excel
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.cancelled || !result.assets || result.assets.length === 0) {
      Alert.alert("Cancelado", "No se seleccionó ningún archivo.");
      return;
    }
    const { uri, name } = result.assets[0];
    console.log(`Archivo seleccionado: ${name} en ${uri}`);
    // Leer el archivo como base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Enviar a Lambda para procesar
    const response = await fetch('https://ouu45b2h18.execute-api.us-east-1.amazonaws.com/extraerexcel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archivoBase64: base64 }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP en Lambda: ${response.status}`);
    }
    const body = await response.json();
    if (!body.datos || !Array.isArray(body.datos) || body.datos.length === 0) {
      Alert.alert("Error", "No se encontraron datos en el Excel o el archivo esta vacio.");
      return;
    }
    console.log("Datos extraidos del Excel:", body.datos);
    // Guardar cada fila en la coleccion 'mascotas'
    let errores = 0;
    for (const bicicleta of body.datos) {
      try {
        // Columnas: 'nombre', 'edad', 'raza' (ajusta si los headers son diferentes)
        await addDoc(collection(db, "bicicletas"), {
          marca: bicicleta.marca || '',
          modelo: bicicleta.modelo || '',
          precio: parseInt(bicicleta.precio) || 0,
          color: bicicleta.color || ''
        });
      } catch (err) {
        console.error("Error guardando bicicleta:", bicicleta, err);
        errores++;
      }
    }
    const guardados = body.datos.length - errores; // Calculamos los guardados exitosos
    if (errores > 0) {
      Alert.alert(
        "Éxito",
        `Se guardaron ${guardados} bicicletas en la colección. Errores: ${errores}.`,
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Éxito", `Se guardaron todas las ${guardados} bicicletas en la colección.`);
    }

  } catch (error) {
    console.error("Error en extraerYGuardarBicicletas:", error);
    Alert.alert("Error", "Error procesando el Excel: " + error.message);
  }
};

  
  //Nuevas importaciones 
const cargarDatosFirebaseCompletos = async () => {
  try {
    const datosExportados = {};
      for (const col of colecciones) {
      const snapshot = await getDocs(collection(db, col));
      datosExportados[col] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
  }));
  }
    return datosExportados;
  }   catch (error) {
    console.error("Error extrayendo datos: ", error);
    }
  };

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

  //Segunda importación
  const exportarDatos = async () => {
  try {
    const datos = await cargarDatosFirebaseCompletos();
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

  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));
      cargarDatos(); // Recargar lista
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const editarProducto = (producto) => {
    setNuevoProducto({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
    });
    setProductoId(producto.id);
    setModoEdicion(true);
  };


  //Lógica del excel
  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

//Segunda parte
const generarExcel = async () => {
  try {
    const datosParaExcel = [
      { nombre: "Producto A", categoria: "Electrónicos", precio: 100 },
      { nombre: "Producto B", categoria: "Ropa", precio: 50 },
      { nombre: "Producto C", categoria: "Electrónicos", precio: 75 }
    ];

    const response = await fetch('https://9qxzhrsnvg.execute-api.us-east-1.amazonaws.com/generarexcel', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datos: datosParaExcel }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Obtencion de ArrayBuffer y conversion a base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Ruta para guardar el archivo temporal
    const fileUri = FileSystem.documentDirectory + "reporte.xlsx";

    // Escribir el archivo en el sistema de archivos
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Compartir el archivo generado
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Descargar Reporte Excel'
      });
    } else {
      alert("Compartir no disponible. Revisa la consola para logs.");
    }
  } catch (error) {
    console.error("Error generando Excel:", error);
    alert("Error: " + error.message);
  }
};

// Prueba ya sin datos estáticos
const cargarCiudadesFirebase = async () => {
  try {
    const snapshot = await getDocs(collection(db, "ciudades"));
    const ciudades = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return ciudades;
  } catch (error) {
    console.error("Error extrayendo ciudades:", error);
    return [];
  }
};

//Segundo generador de excel 
const generarExcelDos = async () => {
  try {
    // Obtener solo datos de "ciudades"
    const ciudades = await cargarCiudadesFirebase();
    if (ciudades.length === 0) {
      throw new Error("No hay datos en la colección 'ciudades'.");
    }

    console.log("Ciudades para Excel:", ciudades);
    const response = await fetch('https://v15dwab3ve.execute-api.us-east-1.amazonaws.com/generarexcel', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datos: ciudades })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Obtencion de ArrayBuffer y conversion a base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // Ruta para guardar el archivo temporalmente
    const fileUri = FileSystem.documentDirectory + "reporte_ciudades.xlsx";

    // Escribir el archivo Excel
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Compartir
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Descargar Reporte de Ciudades'
      });
    } else {
      alert("Compartir no disponible.");
    }

    alert("Excel de ciudades generado y listo para descargar!");
  } catch (error) {
    console.error("Error generando Excel:", error);
    alert("Error: " + error.message);
  }
};

  const pruebaConsulta1 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "Guatemala"),
      orderBy("poblacion", "desc"),
      limit(2)
    );

    const snapshot = await getDocs(q);
    console.log("---------Consulta1--------------");
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}, Nombre: ${data.nombre}`);
    });
  } catch (error) {
    console.log("Error en la consulta:", error);
  }
};

const pruebaConsulta2 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "El Salvador"),
      orderBy("poblacion", "asc"),
      limit(2)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta2: 2 ciudades salvadoreñas, orden población asc--------------");
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta2:", error);
  }
};

const pruebaConsulta3 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("poblacion", "<=", 300000),
      orderBy("poblacion", "asc"),  // Agregado: primer orderBy en el campo del rango
      orderBy("pais", "desc"),
      limit(4)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta3: Ciudades centroamericanas <=300k, orden país desc, limit 4--------------");
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta3:", error);
  }
};

const pruebaConsulta4 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("poblacion", ">", 900000),
      orderBy("poblacion", "asc"),  // Agregado: primer orderBy en el campo del rango
      orderBy("nombre", "asc"),
      limit(3)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta4: 3 ciudades >900k, orden nombre asc--------------");  // Corregí "4 ciudades" a "3 ciudades" para coincidir con el limit
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta4:", error);
  }
};

const pruebaConsulta5 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("pais", "==", "Guatemala"),
      orderBy("poblacion", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta5: Ciudades guatemaltecas, orden población desc, limit 5--------------");
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta5:", error);
  }
};

const pruebaConsulta6 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      where("poblacion", ">=", 200000),
      where("poblacion", "<=", 600000),
      orderBy("poblacion", "asc"),  // Agregado para consistencia y evitar posibles errores futuros
      orderBy("pais", "asc"),
      limit(5)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta6: Ciudades entre 200k y 600k, orden país asc, limit 5--------------");
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta6:", error);
  }
};

const pruebaConsulta7 = async () => {
  try {
    const q = query(
      collection(db, "ciudades"),
      orderBy("poblacion", "desc"),
      orderBy("pais", "desc"),
      limit(5)
    );
    const snapshot = await getDocs(q);
    console.log("---------Consulta7: 5 ciudades con mayor población, orden población desc y país desc--------------");
    if (snapshot.empty) {
      console.log("No hay resultados.");
    } else {
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Nombre: ${data.nombre}, Población: ${data.poblacion}, País: ${data.pais}, etc.`);
      });
    }
  } catch (error) {
    console.log("Error en la consulta7:", error);
  }
};


  useEffect(() => {
    cargarDatos();
    pruebaConsulta1();
    pruebaConsulta2();
    pruebaConsulta3();
    pruebaConsulta4();
    pruebaConsulta5();
    pruebaConsulta6();
    pruebaConsulta7();

  }, []);

  return (
    <View style={styles.container}>

      <FormularioProductos
        nuevoProducto={nuevoProducto}
        manejoCambio={manejoCambio}
        guardarProducto={guardarProducto}
        actualizarProducto={actualizarProducto}
        modoEdicion={modoEdicion}
      />

      
      
      <TablaProductos 
        productos={productos}
        editarProducto={editarProducto} 
        eliminarProducto={eliminarProducto}
      />

      <Button title="Cerrar Sesión"  onPress={cerrarSesion} />
      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar" onPress={exportarDatos} />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Exportar Todo" onPress={exportarDatos} />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel" onPress={generarExcel} />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Generar Excel2" onPress={generarExcelDos} />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Extraer Mascotas desde Excel" onPress={extraerYGuardarMascotas} />
      </View>

      <View style={{ marginVertical: 10 }}>
        <Button title="Extraer Bicicletas desde Excel" onPress={extraerYGuardarBicicletas} />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;