import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-3xl mx-auto px-4 py-8 space-y-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>Terms of Service</h1>
        <p className='text-muted-foreground'>Coming soon.</p>
        <Link to='/' className='text-sm text-muted-foreground hover:text-foreground transition-colors'>← Back</Link>
      </div>
    </div>
  )
}
