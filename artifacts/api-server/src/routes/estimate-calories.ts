import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';

const API_URL = "https://workspaceapi-server-production-b8a8.up.railway.app/api/estimate-calories";

export default function MealScreen() {
  const [meal, setMeal] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const estimateCalories = async () => {
    if (!meal) return;

    Keyboard.dismiss();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealName: meal }) // ✅ matches backend
      });

      const data = await res.json();

      if (data.error) {
        setResult({ error: data.error });
      } else {
        setResult(data);
      }

    } catch (err) {
      console.log(err);
      setResult({ error: "Network error" });
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <Text style={styles.title}>🍽 Meal Calories Estimator</Text>

        {/* INPUT */}
        <TextInput
          style={styles.input}
          placeholder="e.g. Rice, beans, avocado"
          placeholderTextColor="#aaa"
          value={meal}
          onChangeText={setMeal}
        />

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={estimateCalories}>
          <Text style={styles.buttonText}>
            {loading ? "Estimating..." : "Estimate Calories"}
          </Text>
        </TouchableOpacity>

        {/* RESULT */}
        {result && !result.error && (
          <View style={styles.resultCard}>
            <Text style={styles.food}>{result.foodName}</Text>
            <Text style={styles.calories}>
              🔥 {result.calories} kcal
            </Text>
            <Text style={styles.confidence}>
              Confidence: {result.confidence}
            </Text>
            {result.notes ? (
              <Text style={styles.notes}>{result.notes}</Text>
            ) : null}
          </View>
        )}

        {/* ERROR */}
        {result && result.error && (
          <Text style={styles.error}>
            ⚠️ {result.error}
          </Text>
        )}

      </View>
    </TouchableWithoutFeedback>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0b1a2b'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20
  },
  input: {
    backgroundColor: '#1f2c3d',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    marginBottom: 15
  },
  button: {
    backgroundColor: '#00c853',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: '#1f2c3d',
    padding: 15,
    borderRadius: 12
  },
  food: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5
  },
  calories: {
    color: '#00FFAA',
    fontSize: 20,
    fontWeight: 'bold'
  },
  confidence: {
    color: '#aaa',
    marginTop: 5
  },
  notes: {
    color: '#ccc',
    marginTop: 8,
    fontStyle: 'italic'
  },
  error: {
    marginTop: 20,
    color: 'red'
  }
});
