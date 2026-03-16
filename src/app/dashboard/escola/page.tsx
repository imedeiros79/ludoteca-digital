import { checkManagerAccess } from './access';
import { getOrganizationData, getTeachersList } from './actions';
import ManagerDashboardView from './ManagerDashboardView';

export const dynamic = 'force-dynamic';

export default async function EscolaDashboardPage() {
    const { user } = await checkManagerAccess();
    
    const [organization, teachers] = await Promise.all([
        getOrganizationData(),
        getTeachersList()
    ]);

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900">Nenhuma escola vinculada</h1>
                    <p className="text-gray-600">Se você já pagou sua assinatura, aguarde a ativação ou entre em contato com o suporte.</p>
                </div>
            </div>
        );
    }

    return (
        <ManagerDashboardView 
            organization={organization} 
            teachers={teachers} 
            baseUrl={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        />
    );
}
