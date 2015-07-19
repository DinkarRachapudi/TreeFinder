package com.dinkarrachapudi.soatreefinder;


import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;



public class TreeFinder {
	
	public static void main(String[] args) {
		ApplicationContext ctx = new ClassPathXmlApplicationContext("tree-finder-beans.xml");
		ReaderFacade readerFacade = (ReaderFacade)ctx.getBean("readerFacade");
		readerFacade.readData();
	}
}
