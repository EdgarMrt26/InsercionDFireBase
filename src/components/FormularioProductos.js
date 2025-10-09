import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
//import { db } from "../database/firebaseconfig";
import { Doc, addDoc } from "firebase/firestore";



const FormularioProductos = ({ 
  cargarDatos,
  nuevoProducto, 
  manejoCambio, 
  guardarProducto, 
  actualizarProducto, 
  modoEdicion  }) => {
  /*const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");*/

  /*const guardarProducto = async () => {
    if (nombre && precio) {
      try {
        await addDoc(collection(db, "productos"), {
          nombre: nombre,
          precio: parseFloat(precio),
        });
        setNombre("");
        setPrecio("");
        cargarDatos(); //Volver a cargar la lista
      } catch (error) {
        console.log("Error al registrar producto:", error);
      }
    } else {
      alert("Por favor, complete todos los datos");
    }
  };*/

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {modoEdicion ? "Actualizar Producto" : "Registrar Producto"}
      </Text>

      <Button 
        title={modoEdicion ? "Actualizar" : "Guardar"}
        onPress={modoEdicion ? actualizarProducto : guardarProducto}
      />

      <TextInput 
      style={styles.input}
      placeholder="Nombre del producto"
      value={nuevoProducto.nombre}
      onChangeText={(nombre) => manejoCambio("nombre", nombre)}
      />

      <TextInput 
      style={styles.input}
      placeholder="Precio"
      value={nuevoProducto.precio}
      onChangeText={(precio) => manejoCambio("precio", precio)}
      keyboardType="numeric"
      />

      

    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10},
  input: { borderWidth:1, borderColor: "#ccc", padding: 10, marginBottom: 10 },
});

export default FormularioProductos;