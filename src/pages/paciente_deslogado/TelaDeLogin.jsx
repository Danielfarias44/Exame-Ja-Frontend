import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./TelaDeLogin.css";
import {  Button, ButtonGroup, Heading, Text } from '@chakra-ui/react';

export default function Login() {
    return (
      <div>
        <Heading>Login</Heading>
        <Text color="var(--color-primary)">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quod quisquam quasi corporis, cumque ipsum tempora consequuntur, iste mollitia nemo alias numquam dignissimos magnam eos dolore ut recusandae! Commodi, animi fugiat!</Text>
        <Button _hover={{bg:"var(--color-primary-hover)"}} bg="var(--color-primary-soft)" color="var(--color-primary)">Aqui</Button>
      </div>
    );
}