import HeaderBox from '@/components/HeaderBox';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async () => {
  let loggedIn;
  try {
    loggedIn = await getLoggedInUser();
  } catch (error) {
    console.error("Failed to get logged in user", error);
    loggedIn = null; // or handle the error appropriately
  }

  const accounts = [
    {
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
    }
  ];

  const user = loggedIn?.name || "Guest";

  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={user}
            subtext="Access and manage your account and transactions efficiently."
          />
          <TotalBalanceBox
            accounts={accounts}
            totalBanks={1}
            totalCurrentBalance={123114.35}
          />
        </header>

        <div>Recent transactions</div>
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[
          {
            $id: 'bank-1',
            accountId: 'acc-1',
            bankId: 'b1',
            accessToken: 'token-1',
            fundingSourceUrl: 'https://api.dwolla.com/funding-sources/12345',
            userId: loggedIn?.$id || 'mock-user-id',
            sharableId: 'sharable-1',
            currentBalance: 12545.45
          },
          {
            $id: 'bank-2',
            accountId: 'acc-2',
            bankId: 'b2',
            accessToken: 'token-2',
            fundingSourceUrl: 'https://api.dwolla.com/funding-sources/67890',
            userId: loggedIn?.$id || 'mock-user-id',
            sharableId: 'sharable-2',
            currentBalance: 325345.45
          }
        ]}
      />
    </section>
  );
}

export default Home;
