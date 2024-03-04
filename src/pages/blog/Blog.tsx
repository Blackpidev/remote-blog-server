import PostCreate from './components/PostCreate'
import PostList from './components/PostList'

export default function Blog() {
  return (
    <div className='p-5'>
      <PostCreate />
      <PostList />
    </div>
  )
}
