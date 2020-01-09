```
const [ uppyStore ] = useState(() => ObservableStore())
const [ uppyFiles$ ] = useState(() => uppyStore.asObservable('files')

```
