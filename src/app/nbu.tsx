import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

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

async function getPosts(date: string,signal?:AbortSignal) {
    return request<Post[]>(`date=${date}&json`, {signal: signal})
}

export default function RequestsScreen() {
    const [post, setPost] = useState<null | Post>(null);
    const [posts, setPosts] = useState<null | Post[]>(null);

    function loadPost(ddmmyyyy: string, timeout = 10000, controller: null | AbortController = null) {
        if(controller === null)
            controller = new AbortController();
        setTimeout(() => controller.abort(), timeout)

        request<Post[]>(`date=${ddmmyyyy}&json`, {signal: controller.signal})
        .then(data => {setPosts(data)})
    }

    
    useEffect(() => {
        const controller = new AbortController();
        loadPost("20010911", 10000, controller)
        return () => controller.abort()
    }, [])

    return (
        <View style={styles.container}>
            <Button title='Load valutes' onPress={()=>{loadPost("20010911")}} />
            { posts && (
                <FlatList 
                    data={posts}   
                    renderItem={({item}) => (
                        <View>
                            <Text style={{fontSize: 12, fontWeight: 'bold'}}>{item.txt}</Text>
                            <Text style={{fontSize: 12}}>1 {item.txt}. - {item.rate} грн.</Text>
                        </View>
                    )}
                />
                )   
            }
            <Button title='Load valutes' onPress={()=>{getPosts("20010911").then(setPosts)}} />
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
    }
});