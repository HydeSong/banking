import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';

const Home = () => {
    const loggedIn = { firstName: 'Hyde' }

    return (
        <section className='home'>
            <div className='home-content'>
                <header className='home-header'>
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={loggedIn?.firstName || "Guest"}
                        subtext="Access and manage your account and transactions efficiently."
                    />
                    <TotalBalanceBox
                        accounts={[{
                            id: '1',
                            availableBalance: 123124234,
                            currentBalance: 435543,
                            officialName: "dewqeq",
                            mask: "rewewrq",
                            institutionId: "43as",
                            name: "erwer",
                            type: "wrew",
                            subtype: "fwee",
                            appwriteItemId: "drwerw",
                            sharableId: "string;"
                        },
                        {
                            id: '2',
                            availableBalance: 5436654,
                            currentBalance: 45543,
                            officialName: "dewqeq",
                            mask: "rewewrq",
                            institutionId: "43as",
                            name: "345dfsfs",
                            type: "wrew",
                            subtype: "fwee",
                            appwriteItemId: "drwerw",
                            sharableId: "string;"
                        },
                        {
                            id: '3',
                            availableBalance: 5436654,
                            currentBalance: 45543,
                            officialName: "dewqeq",
                            mask: "rewewrq",
                            institutionId: "43as",
                            name: "345dfsfs",
                            type: "wrew",
                            subtype: "fwee",
                            appwriteItemId: "drwerw",
                            sharableId: "string;"
                        }]}
                        totalBanks={1}
                        totalCurrentBalance={123114.35}
                    />
                </header>
            </div>
        </section>
    )
}

export default Home