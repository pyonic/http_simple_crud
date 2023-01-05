const setData = (key: string, value: any) => {
    // @ts-ignore
    process.send(JSON.stringify({ action: 'set', key, value }));
}

export { setData }