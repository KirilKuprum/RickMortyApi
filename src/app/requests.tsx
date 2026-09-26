import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

type Post = {
    userId: number,
    id: number,
    title: string,
    body: string,
}

const BASE_URL = "https://jsonplaceholder.typicode.com/"

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

async function getPosts(signal?:AbortSignal) {
    return request<Post[]>("posts/", {signal: signal})
}

export default function RequestsScreen() {
    const [post, setPost] = useState<null | Post>(null);
    const [posts, setPosts] = useState<null | Post[]>(null);

    function loadPost(id: number, timeout = 10000, controller: null | AbortController = null) {
        if(controller === null)
            controller = new AbortController();
        setTimeout(() => controller.abort(), timeout)

        request<Post>(`posts/${id}`, {signal: controller.signal})
        .then(data => {setPost(data)})
    }

    useEffect(() => {
        const controller = new AbortController();
        loadPost(2, 10000, controller)
        return () => controller.abort()
    }, [])

    return (
        <View style={styles.container}>
            { post && (
                    <>
                        <Text style={styles.textHeader}>{post.title}</Text>
                        <Text>{post.body}</Text>
                    </>
                )
            }
            <Button title='Load post' onPress={()=>{loadPost(1)}} />
            { posts && (
                <FlatList 
                    data={posts}   
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({item}) => (
                        <View>
                            <Text style={{fontSize: 12, fontWeight: 'bold'}}>{item.title}</Text>
                            <Text style={{fontSize: 12}}>{item.body}</Text>
                        </View>
                    )}
                />
                )   
            }
            <Button title='Load posts' onPress={()=>{getPosts().then(setPosts)}} />
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