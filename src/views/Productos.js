import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { db } from "../database/firebaseconfig.js";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, QuerySnapshot, orderBy, limit, query, where } from "firebase/firestore";
import FormularioProductos from "../components/FormularioProductos";
import TablaProductos from "../components/TablaProductos.js";

const Productos = ({cerrarSesion}) => {

  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoId, setProductoId] = useState(null);

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

      <Button title="Cerrar Sesión"  onPress={cerrarSesion} />

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
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});

export default Productos;