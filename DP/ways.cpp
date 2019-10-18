#include<bits/stdc++.h>
using namespace std;
long long mod=100000007;

long long countWays(int m){
        long long arr[m+1]={0};
    arr[0]=1;
    for(int i=1;i<=m;i++)
    arr[i]+=arr[i-1];
    for(int i=2;i<=m;i++)
    arr[i]+=arr[i-2];
    
    return arr[m];

}

int main(){
int n;
cin>>n;
cout<<countWays(n);
return 0;
}