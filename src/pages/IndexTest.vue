<template>
  <q-page class="flex flex-center">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td class="flex flex-center" align="center">
          <h2>Get expert guidance on unemployment</h2>
          <p>
            Sky Bureau offers professional consultation for individuals and
            businesses facing unemployment challenges.
          </p>
        </td>
      </tr>
    </table>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <div>
            <p>&nbsp;</p>
            <p>
              Introducing Sky Bureau, a leading unemployment alliance and
              consultant based in Shanghai, SH. Our team specializes in
              providing strategic solutions for individuals and businesses
              navigating the challenges of unemployment. With our expertise and
              resources, we are dedicated to helping our clients find
              opportunities for growth and success in the ever-changing job
              market. Whether you are seeking guidance on career transitions or
              organizational restructuring, Sky Bureau is committed to
              supporting you every step of the way. Let us help you turn
              uncertainty into opportunity.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td width="100%" colspan="3" align="center" class="flex flex-center">
          <h2>Practice areas</h2>
        </td>
      </tr>
      <tr>
        <td width="33%">
          <q-img
            src="./imgs/career_plan.png"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
        <td width="33%">
          <q-img
            src="./imgs/job_market_analysis.png"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
        <td width="33%">
          <q-img
            src="./imgs/resume_optimization.png"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
      </tr>
      <tr>
        <td width="33%">
          Tailored guidance to help you plan and achieve your career goals.
        </td>
        <td width="33%">
          Insights and strategies to navigate the current job market and
          maximize employment opportunities.
        </td>
        <td width="33%">
          Optimize your resume to showcase your skills and experience,
          increasing our chances of landing interviews.
        </td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td colspan="3">&nbsp;</td>
      </tr>
    </table>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td width="100%" colspan="3" align="center" class="flex flex-center">
          <h2>Meet the team</h2>
        </td>
      </tr>
      <tr>
        <td width="33%" class="flex flex-center">
          <q-img
            src="./imgs/p3.jpg"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
        <td width="33%">
          <q-img
            src="./imgs/p2.jpg"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
        <td width="33%">
          <q-img
            src="./imgs/p1.jpg"
            spinner-color="white"
            style="width: 300px; height: 300px; margin: 0 auto"
          />
        </td>
      </tr>
      <tr>
        <td width="33%">
          A highly skilled consultant with expertise in helping individuals and
          organizations address unemployment challenges.
        </td>
        <td width="33%">
          An experienced consultant specializing in providing valuable insights
          and solutions to address unemployment issues.
        </td>
        <td width="33%">
          A talented consultant dedicated to assisting individuals and
          businesses in overcoming unemployment hardles and achieving success.
        </td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td colspan="3">&nbsp;</td>
      </tr>
    </table>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { LocalStorage } from "quasar";

export default defineComponent({
  setup() {
    console.log("IndexPage");
    console.log(LocalStorage.getItem("userInfo"));
  },

  name: "IndexPage",
  getUserInfo() {
    return LocalStorage.getItem("userInfo");
  },
});
</script>
