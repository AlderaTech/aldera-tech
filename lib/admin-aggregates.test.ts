import { expect, it } from "bun:test";

it("preserves revenue, billable cost and workload while paginating database aggregates", () => {
  const script = `import assert from'node:assert/strict';
    const {prisma}=await import('./lib/prisma.ts');
    const {getAdminAnalytics}=await import('./app/admin/analytics/_data/analytics.ts');
    const {getTimesheetSummary}=await import('./app/admin/timesheet/_data/timesheet-summary.ts');
    const {getUsersAndWorkloadData}=await import('./app/admin/users/_data/get-users-and-workload.ts');
    const {getOverviewAnalytics}=await import('./app/dashboard/_data/overview-analytics.ts');
    const user=await prisma.user.create({data:{email:crypto.randomUUID()+'@example.test',name:'Aggregate fixture',password:'not-live',roles:['ADMIN','DEVELOPER']}});
    const project=await prisma.project.create({data:{title:'Aggregate fixture',description:'Isolated test fixture',clientId:user.id,status:'IN_PROGRESS',assignments:{create:{userId:user.id}}}});
    try {
      await prisma.invoice.create({data:{number:crypto.randomUUID(),clientId:user.id,projectId:project.id,dueDate:new Date(),status:'PAID',paidAt:new Date(),subtotal:800000000000,total:800000000000}});
      const from=new Date(),to=new Date(from.getTime()+1000);from.setTime(from.getTime()-1000);
      await prisma.timeEntry.create({data:{projectId:project.id,userId:user.id,description:'Billable fixture',startedAt:new Date(),durationSec:3600,billable:true}});
      await prisma.timeEntry.create({data:{projectId:project.id,userId:user.id,description:'Nonbillable fixture',startedAt:new Date(),durationSec:1800,billable:false}});
      await prisma.task.createMany({data:[{projectId:project.id,title:'Done fixture',status:'DONE'},{projectId:project.id,title:'Review fixture',status:'REVIEW'}]});
      await prisma.milestone.create({data:{projectId:project.id,title:'Pending fixture',status:'PENDING'}});
      const overview=await getOverviewAnalytics(user.id);assert.deepEqual(overview.work,{completed:1,active:1,pending:1});assert.deepEqual(overview.payments,{paid:1,waiting:0,verification:0});
      const baseline=await prisma.invoice.aggregate({where:{status:'PAID'},_sum:{total:true}});
      const data=await getAdminAnalytics();assert.equal(data.totalRevenue,Number(baseline._sum.total));
      const settings=await prisma.siteSetting.findUnique({where:{id:'site'}});const p=data.projectProfitability.find(p=>p.id===project.id);assert.ok(p);assert.equal(p.cost,Number(settings?.hourlyRate??150000));assert.equal(p.hours,1);
      const time=await getTimesheetSummary(from,to,1,1);const row=time.userSummary.find(r=>r.id===user.id);assert.ok(row);assert.equal(row.totalSec,5400);assert.equal(row.billableSec,3600);assert.equal(row.entries,2);assert.ok(time.userSummary.length<=20);
      const list=await getUsersAndWorkloadData({page:1,role:'ADMIN'});assert.ok(list.users.length<=20);assert.equal(list.counts.all,await prisma.user.count());assert.ok(!('password' in list.users[0]));
      const workload=await getUsersAndWorkloadData({page:1,workload:true});const staff=workload.staffWorkload.find(r=>r.id===user.id);assert.ok(staff);assert.equal(staff.activeProjects,1);assert.ok(workload.staffWorkload.length<=20);assert.equal(workload.users.length,0);
    } finally {await prisma.project.delete({where:{id:project.id}});await prisma.user.delete({where:{id:user.id}});await prisma.$disconnect();}`;
  const result = Bun.spawnSync(
    [process.execPath, "--no-env-file", "-e", script],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (result.exitCode) throw new Error(result.stderr.toString());
  expect(result.exitCode).toBe(0);
}, 30_000);
