import { Layout } from '@/components/ui/Layout';

export default function TestPage() {
    return (
        <Layout>
            <div className="p-10">
                <h1 className="text-3xl font-bold">Test Page</h1>
                <p>If you see this, Layout is fixed.</p>
            </div>
        </Layout>
    );
}
