import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

type Post = {
    exchangedate: string,
    txt: string,
    rate: number,
}

const BASE_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?"

async function request<T>(path: string, options: RequestInit = {}, headers = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            }
    })

    if(!response.ok) throw new Error(`Fetch error: ${response.status}`);

    return response.json() as Promise<T>;
}

async function getPosts(cc: string,signal?:AbortSignal) {
    return request<Post[]>(`valcode=${cc}&json`, {signal: signal})
}

export default function RequestsScreen() {
    const [posts, setPosts] = useState<null | Post[]>(null);
     const [amount, setAmount] = useState(0);

    const [valuta, setValuta] = useState("");

    const [result, setResult] = useState<Post | null>(null);
    function loadPost(cc: string, timeout = 10000, controller: null | AbortController = null) {
        if(controller === null)
            controller = new AbortController();
        setTimeout(() => controller.abort(), timeout)

        request<Post[]>(`valcode=${cc}&json`, {signal: controller.signal})
        .then(data => {setPosts(data)})
    }
    function loadResult(cc: string, timeout = 10000, controller: null | AbortController = null) {
        if(controller === null)
            controller = new AbortController();
        setTimeout(() => controller.abort(), timeout)

        request<Post[]>(`valcode=${cc}&json`, {signal: controller.signal})
        .then(data => {setResult(data[0])})
    }
    useEffect(() => {
        const controller = new AbortController();
        loadPost("KZT", 10000, controller)
        return () => controller.abort()
    }, [])

   
    function convert() {
        loadResult(valuta);
    }
    return (
        <View style={styles.container}>
            <Button title='Load valutes' onPress={()=>{loadPost("KZT")}} />
                <FlatList 
                    data={posts}   
                    renderItem={({item}) => (
                        <>
                            <View>
                                <TextInput style={styles.textInput} placeholder='Введіть кількість валюти' value={`${amount}`} onChangeText={(text) => setAmount(Number(text))}/>
                                { amount > 0 &&
                                    <Text style={{fontSize: 12}}>{amount} {item.txt}. - {item.rate*amount} грн.</Text>

                                }
                            </View>
                        </>
                    )}
                />

            <TextInput style={styles.textInput} placeholder='Введіть назву валюти' value={`${valuta}`} onChangeText={setValuta}/>

            <Button title='Конвертувати' onPress={convert} />
            {result && amount > 0 && (
                <Text>{amount} {result.txt} = {(result.rate * amount).toFixed(2)} грн.</Text>
            )}
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    textHeader: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    textInput: {
         color: 'white',
        borderWidth: 1,
        backgroundColor: '#1c1c1e',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginVertical: 5,
    }
});