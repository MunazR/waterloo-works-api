const puppeteer = require('puppeteer');
const puppeteerUtil = require('../util/puppeteerUtil');

const authLib = require('../lib/authLib');
const interviewsLib = require('../lib/interviewsLib');

module.exports = (app) => {
  app.post('/interviews/get', async (req, res) => {
    const {
      username,
      password,
    } = req.body;
    let {
      numOfDays,
    } = req.body;

    if (!username || !password) {
      return res.json({
        status: 'Error',
        message: 'Missing parameter username, password, numOfDays',
      });
    }

    if (!numOfDays) {
      numOfDays = -1;
    }

    const browser = await puppeteer.launch(puppeteerUtil.getLaunchFlags());
    
    try {
      const page = await browser.newPage();

      try {
        await authLib.login(page, username, password);
      } catch (error) {
        return res.json({
          status: 'Error',
          message: 'Failed to login',
        });
      }

      const {
        interviewIds,
        interviews,
      } = await interviewsLib.getInterviews(page, numOfDays);

      return res.json({
        status: 'OK',
        interviews: interviews,
        interviewIds: interviewIds,
      });
    } catch (error) {
      return res.json({
        status: 'Error',
        message: 'An unknown error occurred',
        error: error.message,
      });
    } finally {
      await browser.close();
    }
  });
};
