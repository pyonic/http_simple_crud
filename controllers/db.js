const setData = (key, value) => {
    process.send(JSON.stringify({ action: 'set', key, value }));
}

module.exports = {
    setData,
}