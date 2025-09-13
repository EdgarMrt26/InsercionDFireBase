import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
//import { db } from "/src/database/firebaseconfig";
import { db } from "./src/database/firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

export default function App() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Preparación para subcolecciones (se ejecutará solo si existen)
        const productosConSubcoleccion = await Promise.all(
          data.map(async (item) => {
            const subcoleccionSnapshot = await getDocs(collection(db, "productos", item.id, "sabores")).catch(() => []);
            const subcoleccionData = subcoleccionSnapshot.docs.map(subDoc => ({
              ...subDoc.data(),
              itemId: subDoc.id,
            }));

            return productosConSubcoleccionData.length > 0 ? { ...item, sabores: subcoleccionData } : item;
          })
        );

        setProductos(productosConSubcoleccion);
      } catch (error) {
        console.error("Error al obtener documentos:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Productos</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre} - {item.precio}</Text>
            {item.sabores && item.sabores.length > 0 && (
              <FlatList
                data={item.sabores}
                keyExtractor={(subItem) => subItem.id}
                renderItem={({ item: subItem }) => (
                  <Text style={{ ...styles.item, marginLeft: 20 }}>
                    Sabor: {subItem.sabor}
                  </Text>
                )}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  item: { fontSize: 18, marginBottom: 5 },
});